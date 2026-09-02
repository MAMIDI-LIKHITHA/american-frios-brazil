import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { OrderDetail, StatusBadge, dateTime } from "@/components/admin/OrderDetail";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  STATUS_FLOW,
  STATUS_LABELS,
  downloadCsv,
  fetchAdminOrders,
  fetchAdminStores,
  ordersToCsv,
  paymentLabel,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/orders-db";

export const Route = createFileRoute("/admin/pedidos")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Pedidos | Painel América Frios" },
      {
        name: "description",
        content: "Gestão de pedidos da América Frios: busca, filtros, detalhes e status.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Pedidos | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita para gestão de pedidos da América Frios.",
      },
    ],
  }),
  component: AdminOrdersPage,
});

const onlyDigits = (v: string) => v.replace(/\D/g, "");

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [openOrder, setOpenOrder] = useState<AdminOrder | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [type, setType] = useState<"all" | "Atacado" | "Varejo">("all");
  const [fulfillment, setFulfillment] = useState<"all" | "Pickup" | "Delivery">("all");
  const [storeId, setStoreId] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });
  const storesQuery = useQuery({ queryKey: ["admin-stores"], queryFn: fetchAdminStores });
  const orders = ordersQuery.data ?? [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const digits = onlyDigits(search);
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTs = to ? new Date(`${to}T23:59:59.999`).getTime() : null;

    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (type !== "all" && o.order_type !== type) return false;
      if (fulfillment !== "all" && o.fulfillment_type !== fulfillment) return false;
      if (storeId !== "all" && o.store_id !== storeId) return false;
      const ts = new Date(o.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      if (term) {
        const matches =
          o.order_number.toLowerCase().includes(term) ||
          o.customer_name.toLowerCase().includes(term) ||
          (digits.length >= 3 && onlyDigits(o.customer_phone).includes(digits));
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, search, status, type, fulfillment, storeId, from, to]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status: s }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, s),
    onSuccess: (_d, v) => {
      toast.success(`Status atualizado para ${STATUS_LABELS[v.status]}`);
      setOpenOrder((o) => (o && o.id === v.id ? { ...o, status: v.status } : o));
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const storeName = (id: string | null) =>
    storesQuery.data?.find((s) => s.id === id)?.name ?? "—";
  const store = (id: string | null) => storesQuery.data?.find((s) => s.id === id) ?? null;

  function handleExport() {
    if (visible.length === 0) {
      toast.error("Nenhum pedido para exportar com os filtros atuais.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`pedidos-america-frios-${stamp}.csv`, ordersToCsv(visible, storeName));
    toast.success(`${visible.length} pedido(s) exportado(s).`);
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setType("all");
    setFulfillment("all");
    setStoreId("all");
    setFrom("");
    setTo("");
  }

  const selectClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

  return (
    <AdminShell
      title="Pedidos"
      subtitle="Pedidos mais recentes primeiro. Use os filtros para localizar um pedido."
      actions={
        <>
          <button
            onClick={() => void ordersQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </>
      }
    >
      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Buscar</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nº do pedido, nome ou telefone"
            className={`mt-1 ${selectClass}`}
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
            className={`mt-1 ${selectClass}`}
          >
            <option value="all">Todos</option>
            {[...STATUS_FLOW, "cancelled" as OrderStatus].map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Tipo</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className={`mt-1 ${selectClass}`}
          >
            <option value="all">Todos</option>
            <option value="Atacado">Atacado</option>
            <option value="Varejo">Varejo</option>
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Entrega</span>
          <select
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value as typeof fulfillment)}
            className={`mt-1 ${selectClass}`}
          >
            <option value="all">Todas</option>
            <option value="Pickup">Retirada</option>
            <option value="Delivery">Entrega</option>
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Loja</span>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className={`mt-1 ${selectClass}`}
          >
            <option value="all">Todas</option>
            {(storesQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">De</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`mt-1 ${selectClass}`}
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Até</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`mt-1 ${selectClass}`}
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {visible.length} pedido(s) exibido(s) de {orders.length}.
      </p>

      {ordersQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando pedidos…</p>
      ) : ordersQuery.isError ? (
        <p className="mt-6 text-sm text-destructive">
          Não foi possível carregar os pedidos. Tente atualizar a página.
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Nenhum pedido encontrado com os filtros atuais.
        </p>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Pedido</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Telefone</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Entrega</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Pagamento</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-3 font-semibold">{o.order_number}</td>
                    <td className="px-3 py-3">{o.customer_name}</td>
                    <td className="px-3 py-3 tabular-nums">{o.customer_phone}</td>
                    <td className="px-3 py-3">{o.order_type}</td>
                    <td className="px-3 py-3">
                      {o.fulfillment_type === "Pickup" ? "Retirada" : "Entrega"}
                    </td>
                    <td className="px-3 py-3 font-semibold tabular-nums">
                      {brl(Number(o.total))}
                    </td>
                    <td className="px-3 py-3">{paymentLabel(o.payment_method)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{dateTime(o.created_at)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => setOpenOrder(o)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                      >
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden">
            {visible.map((o) => (
              <button
                key={o.id}
                onClick={() => setOpenOrder(o)}
                className="rounded-2xl border border-border bg-card p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{o.order_number}</p>
                    <p className="text-sm text-muted-foreground">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {o.order_type} · {o.fulfillment_type === "Pickup" ? "Retirada" : "Entrega"} ·{" "}
                    {paymentLabel(o.payment_method)}
                  </span>
                  <span className="font-bold tabular-nums">{brl(Number(o.total))}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{dateTime(o.created_at)}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {openOrder && (
        <OrderDetail
          order={openOrder}
          store={store(openOrder.store_id)}
          onClose={() => setOpenOrder(null)}
          onStatus={(s) => statusMutation.mutate({ id: openOrder.id, status: s })}
          busy={statusMutation.isPending}
        />
      )}
    </AdminShell>
  );
}
