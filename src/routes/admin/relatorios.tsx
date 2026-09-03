import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, BarBreakdown, StatCard } from "@/components/admin/AdminShell";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  STATUS_FLOW,
  STATUS_LABELS,
  downloadCsv,
  fetchAdminStores,
  fetchItemsForOrders,
  fetchOrdersRange,
  ordersToCsv,
  type OrderStatus,
} from "@/lib/orders-db";

export const Route = createFileRoute("/admin/relatorios")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Relatórios | Painel América Frios" },
      {
        name: "description",
        content: "Relatórios de vendas, produtos e lojas da América Frios por período.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Relatórios | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita com relatórios de vendas da América Frios.",
      },
    ],
  }),
  component: AdminReportsPage,
});

type PresetId = "today" | "yesterday" | "last7" | "month" | "prevMonth" | "custom";

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "last7", label: "Últimos 7 dias" },
  { id: "month", label: "Este mês" },
  { id: "prevMonth", label: "Mês anterior" },
  { id: "custom", label: "Período personalizado" },
];

const iso = (d: Date) => d.toISOString();
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function resolveRange(preset: PresetId, customFrom: string, customTo: string) {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  switch (preset) {
    case "today": {
      const s = startOfDay(now);
      return { start: s, end: addDays(s, 1) };
    }
    case "yesterday": {
      const s = addDays(startOfDay(now), -1);
      return { start: s, end: addDays(s, 1) };
    }
    case "last7": {
      const end = addDays(startOfDay(now), 1);
      return { start: addDays(end, -7), end };
    }
    case "month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case "prevMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case "custom": {
      const s = customFrom ? new Date(`${customFrom}T00:00:00`) : startOfDay(now);
      const e = customTo ? addDays(new Date(`${customTo}T00:00:00`), 1) : addDays(s, 1);
      return { start: s, end: e };
    }
  }
}

function AdminReportsPage() {
  const [preset, setPreset] = useState<PresetId>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const range = useMemo(() => resolveRange(preset, customFrom, customTo), [
    preset,
    customFrom,
    customTo,
  ]);

  const ordersQuery = useQuery({
    queryKey: ["admin-report-orders", iso(range.start), iso(range.end)],
    queryFn: () => fetchOrdersRange(iso(range.start), iso(range.end)),
  });
  const orders = ordersQuery.data ?? [];
  const orderIds = orders.map((o) => o.id);

  const itemsQuery = useQuery({
    queryKey: ["admin-report-items", orderIds.join(",")],
    queryFn: () => fetchItemsForOrders(orderIds),
    enabled: orders.length > 0,
  });
  const storesQuery = useQuery({ queryKey: ["admin-stores"], queryFn: fetchAdminStores });

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const sales = valid.reduce((n, o) => n + Number(o.total), 0);
    const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
    return {
      total: orders.length,
      sales,
      average: valid.length ? sales / valid.length : 0,
      completed: count("completed"),
      cancelled: count("cancelled"),
      pending: orders.filter((o) => o.status === "new" || o.status === "confirmed").length,
      atacado: orders.filter((o) => o.order_type === "Atacado").length,
      varejo: orders.filter((o) => o.order_type === "Varejo").length,
      pickup: orders.filter((o) => o.fulfillment_type === "Pickup").length,
      delivery: orders.filter((o) => o.fulfillment_type === "Delivery").length,
    };
  }, [orders]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const k = dayKey(new Date(o.created_at));
        map.set(k, (map.get(k) ?? 0) + Number(o.total));
      });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        label: k.split("-").reverse().slice(0, 2).join("/"),
        value: v,
      }));
  }, [orders]);

  const statusRows = useMemo(
    () =>
      [...STATUS_FLOW, "cancelled" as OrderStatus].map((s) => ({
        label: STATUS_LABELS[s],
        value: orders.filter((o) => o.status === s).length,
      })),
    [orders],
  );

  const products = useMemo(() => {
    const map = new Map<string, { quantity: number; sales: number }>();
    const validIds = new Set(orders.filter((o) => o.status !== "cancelled").map((o) => o.id));
    (itemsQuery.data ?? [])
      .filter((i) => validIds.has(i.order_id))
      .forEach((i) => {
        const cur = map.get(i.product_name) ?? { quantity: 0, sales: 0 };
        cur.quantity += Number(i.quantity);
        cur.sales += Number(i.subtotal);
        map.set(i.product_name, cur);
      });
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.sales - a.sales);
  }, [itemsQuery.data, orders]);

  const storeRows = useMemo(() => {
    const stores = storesQuery.data ?? [];
    return stores.map((s) => {
      const own = orders.filter((o) => o.store_id === s.id);
      const valid = own.filter((o) => o.status !== "cancelled");
      return {
        id: s.id,
        name: s.name,
        orders: own.length,
        sales: valid.reduce((n, o) => n + Number(o.total), 0),
        pickup: own.filter((o) => o.fulfillment_type === "Pickup").length,
      };
    });
  }, [orders, storesQuery.data]);

  const storeName = (id: string | null) =>
    storesQuery.data?.find((s) => s.id === id)?.name ?? "—";

  function handleExport() {
    if (orders.length === 0) {
      toast.error("Nenhum pedido no período selecionado.");
      return;
    }
    const name = `relatorio-america-frios-${dayKey(range.start)}_a_${dayKey(
      new Date(range.end.getTime() - 1),
    )}.csv`;
    downloadCsv(name, ordersToCsv(orders, storeName));
    toast.success(`${orders.length} pedido(s) exportado(s).`);
  }

  const periodLabel = `${range.start.toLocaleDateString("pt-BR")} — ${new Date(
    range.end.getTime() - 1,
  ).toLocaleDateString("pt-BR")}`;

  return (
    <AdminShell
      title="Relatórios"
      subtitle={`Período: ${periodLabel}. Valores calculados a partir dos totais salvos no banco.`}
      actions={
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      }
    >
      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              preset === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">De</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Até</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      {ordersQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando relatório…</p>
      ) : ordersQuery.isError ? (
        <p className="mt-6 text-sm text-destructive">Não foi possível carregar o relatório.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Pedidos" value={String(stats.total)} />
            <StatCard label="Vendas" value={brl(stats.sales)} highlight />
            <StatCard label="Ticket médio" value={brl(stats.average)} />
            <StatCard label="Concluídos" value={String(stats.completed)} />
            <StatCard label="Cancelados" value={String(stats.cancelled)} />
            <StatCard label="Novos/pendentes" value={String(stats.pending)} />
            <StatCard label="Atacado" value={String(stats.atacado)} />
            <StatCard label="Varejo" value={String(stats.varejo)} />
            <StatCard label="Retirada" value={String(stats.pickup)} />
            <StatCard label="Entrega" value={String(stats.delivery)} />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <BarBreakdown
              title="Atacado x Varejo"
              rows={[
                { label: "Atacado", value: stats.atacado },
                { label: "Varejo", value: stats.varejo },
              ]}
            />
            <BarBreakdown
              title="Retirada x Entrega"
              rows={[
                { label: "Retirada", value: stats.pickup },
                { label: "Entrega", value: stats.delivery },
              ]}
            />
            <BarBreakdown title="Pedidos por status" rows={statusRows} />
          </div>

          <div className="mt-4">
            <BarBreakdown
              title="Vendas por dia"
              rows={byDay.length ? byDay : [{ label: "Sem vendas", value: 0 }]}
              formatValue={(n) => brl(n)}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              Produtos mais vendidos
            </h2>
            {products.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Nenhum produto vendido no período.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Qtd. vendida</th>
                      <th className="px-4 py-3">Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.name} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{p.name}</td>
                        <td className="px-4 py-3 tabular-nums">{p.quantity}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold">{brl(p.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {storeRows.length > 1 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-foreground">Desempenho por loja</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Loja</th>
                      <th className="px-4 py-3">Pedidos</th>
                      <th className="px-4 py-3">Retiradas</th>
                      <th className="px-4 py-3">Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeRows.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{s.name}</td>
                        <td className="px-4 py-3 tabular-nums">{s.orders}</td>
                        <td className="px-4 py-3 tabular-nums">{s.pickup}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold">{brl(s.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
