import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { AdminShell, BarBreakdown, StatCard } from "@/components/admin/AdminShell";
import { OrderDetail, StatusBadge, dateTime } from "@/components/admin/OrderDetail";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  STATUS_LABELS,
  fetchAdminOrders,
  fetchAdminStores,
  paymentLabel,
  updateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/orders-db";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Painel administrativo | América Frios" },
      {
        name: "description",
        content:
          "Painel interno da América Frios para acompanhar pedidos, vendas e relatórios. Acesso restrito à equipe.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel administrativo | América Frios" },
      {
        property: "og:description",
        content: "Painel interno da América Frios para gestão de pedidos e relatórios.",
      },
    ],
  }),
  component: AdminHomePage,
});

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

function AdminHomePage() {
  const queryClient = useQueryClient();
  const [openOrder, setOpenOrder] = useState<AdminOrder | null>(null);

  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });
  const storesQuery = useQuery({ queryKey: ["admin-stores"], queryFn: fetchAdminStores });
  const orders = ordersQuery.data ?? [];

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.created_at));
    const todayValid = today.filter((o) => o.status !== "cancelled");
    const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
    return {
      todayCount: today.length,
      todaySales: todayValid.reduce((n, o) => n + Number(o.total), 0),
      new: count("new"),
      preparing: count("preparing"),
      ready: count("ready"),
      completed: count("completed"),
      cancelled: count("cancelled"),
      atacado: orders.filter((o) => o.order_type === "Atacado").length,
      varejo: orders.filter((o) => o.order_type === "Varejo").length,
      pickup: orders.filter((o) => o.fulfillment_type === "Pickup").length,
      delivery: orders.filter((o) => o.fulfillment_type === "Delivery").length,
    };
  }, [orders]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_d, v) => {
      toast.success(`Status atualizado para ${STATUS_LABELS[v.status]}`);
      setOpenOrder((o) => (o && o.id === v.id ? { ...o, status: v.status } : o));
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  const store = (id: string | null) => storesQuery.data?.find((s) => s.id === id) ?? null;
  const recent = orders.slice(0, 8);

  return (
    <AdminShell
      title="Painel administrativo"
      subtitle="Resumo do dia e situação dos pedidos."
      actions={
        <>
          <button
            onClick={() => void ordersQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <Link
            to="/admin/pedidos"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Gerenciar pedidos
          </Link>
        </>
      }
    >
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Pedidos de hoje" value={String(stats.todayCount)} />
        <StatCard label="Vendas de hoje" value={brl(stats.todaySales)} highlight />
        <StatCard label="Novos" value={String(stats.new)} />
        <StatCard label="Em preparo" value={String(stats.preparing)} />
        <StatCard label="Prontos" value={String(stats.ready)} />
        <StatCard label="Concluídos" value={String(stats.completed)} />
        <StatCard label="Cancelados" value={String(stats.cancelled)} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">Pedidos recentes</h2>
          <Link to="/admin/pedidos" className="text-sm font-semibold text-primary">
            Ver todos
          </Link>
        </div>

        {ordersQuery.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando pedidos…</p>
        ) : ordersQuery.isError ? (
          <p className="mt-6 text-sm text-destructive">
            Não foi possível carregar os pedidos. Tente atualizar a página.
          </p>
        ) : recent.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum pedido registrado até agora.
          </p>
        ) : (
          <div className="mt-5 grid gap-3">
            {recent.map((o) => (
              <button
                key={o.id}
                onClick={() => setOpenOrder(o)}
                className="rounded-2xl border border-border bg-card p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{o.order_number}</p>
                    <p className="text-sm text-muted-foreground">{o.customer_name}</p>
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
        )}
      </div>

      {openOrder && (
        <OrderDetail
          order={openOrder}
          store={store(openOrder.store_id)}
          onClose={() => setOpenOrder(null)}
          onStatus={(status) => statusMutation.mutate({ id: openOrder.id, status })}
          busy={statusMutation.isPending}
        />
      )}
    </AdminShell>
  );
}
