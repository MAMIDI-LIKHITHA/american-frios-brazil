import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  STATUS_FLOW,
  STATUS_LABELS,
  fetchAdminOrders,
  fetchOrderItems,
  fetchStores,
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
          "Painel interno da América Frios para acompanhar pedidos, produtos e lojas. Acesso restrito à equipe.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel administrativo | América Frios" },
      {
        property: "og:description",
        content: "Painel interno da América Frios para gestão de pedidos e produtos.",
      },
    ],
  }),
  component: AdminHomePage,
});

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-blue-500/10 text-blue-700",
  preparing: "bg-amber-500/15 text-amber-700",
  ready: "bg-emerald-500/15 text-emerald-700",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function AdminHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [openOrder, setOpenOrder] = useState<AdminOrder | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const ordersQuery = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });
  const storesQuery = useQuery({ queryKey: ["admin-stores"], queryFn: fetchStores });

  const orders = ordersQuery.data ?? [];

  const stats = useMemo(() => {
    const todays = orders.filter((o) => isToday(o.created_at) && o.status !== "cancelled");
    return {
      todayCount: todays.length,
      todaySales: todays.reduce((n, o) => n + Number(o.total), 0),
      new: orders.filter((o) => o.status === "new").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      completed: orders.filter((o) => o.status === "completed").length,
    };
  }, [orders]);

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success(`Status atualizado para ${STATUS_LABELS[variables.status]}`);
      setOpenOrder((o) => (o && o.id === variables.id ? { ...o, status: variables.status } : o));
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const storeName = (id: string | null) =>
    storesQuery.data?.find((s) => s.id === id)?.name ?? null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Painel administrativo
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? `Conectado como ${email}` : "Área restrita da equipe América Frios."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void ordersQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={() => navigate({ to: "/admin/change-password" })}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Alterar senha
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Pedidos de hoje" value={String(stats.todayCount)} />
        <StatCard label="Vendas de hoje" value={brl(stats.todaySales)} highlight />
        <StatCard label="Novos pedidos" value={String(stats.new)} />
        <StatCard label="Em preparo" value={String(stats.preparing)} />
        <StatCard label="Concluídos" value={String(stats.completed)} />
      </div>

      {/* Pedidos */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">Pedidos</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", ...STATUS_FLOW, "cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {s === "all" ? "Todos" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {ordersQuery.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando pedidos…</p>
        ) : ordersQuery.isError ? (
          <p className="mt-6 text-sm text-destructive">
            Não foi possível carregar os pedidos. Tente atualizar a página.
          </p>
        ) : visible.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum pedido {filter === "all" ? "registrado" : "nesse status"} até agora.
          </p>
        ) : (
          <>
            {/* Tabela (desktop) */}
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Pedido</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Entrega</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{o.order_number}</td>
                      <td className="px-4 py-3">{o.customer_name}</td>
                      <td className="px-4 py-3">{o.order_type}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold">
                        {brl(Number(o.total))}
                      </td>
                      <td className="px-4 py-3">{paymentLabel(o.payment_method)}</td>
                      <td className="px-4 py-3">
                        {o.fulfillment_type === "Pickup" ? "Retirada" : "Entrega"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{dateTime(o.created_at)}</td>
                      <td className="px-4 py-3 text-right">
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

            {/* Cards (mobile) */}
            <div className="mt-5 grid gap-3 lg:hidden">
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
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {o.order_type} ·{" "}
                      {o.fulfillment_type === "Pickup" ? "Retirada" : "Entrega"} ·{" "}
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
      </div>

      {openOrder && (
        <OrderDetail
          order={openOrder}
          storeName={storeName(openOrder.store_id)}
          onClose={() => setOpenOrder(null)}
          onStatus={(status) => statusMutation.mutate({ id: openOrder.id, status })}
          busy={statusMutation.isPending}
        />
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function OrderDetail({
  order,
  storeName,
  onClose,
  onStatus,
  busy,
}: {
  order: AdminOrder;
  storeName: string | null;
  onClose: () => void;
  onStatus: (status: OrderStatus) => void;
  busy: boolean;
}) {
  const itemsQuery = useQuery({
    queryKey: ["admin-order-items", order.id],
    queryFn: () => fetchOrderItems(order.id),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Pedido {order.order_number}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateTime(order.created_at)} · {order.order_type}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg border border-border p-2 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Status atual</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...STATUS_FLOW, "cancelled" as OrderStatus].map((s) => (
              <button
                key={s}
                disabled={busy || s === order.status}
                onClick={() => onStatus(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-100 ${
                  s === order.status
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-accent disabled:opacity-50"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border">
          {itemsQuery.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Carregando itens…</p>
          ) : (itemsQuery.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum item registrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(itemsQuery.data ?? []).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{i.product_name}</p>
                    <p className="text-muted-foreground">
                      {Number(i.quantity)} × {brl(Number(i.unit_price))}
                    </p>
                  </div>
                  <span className="font-bold tabular-nums">{brl(Number(i.subtotal))}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border p-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{brl(Number(order.subtotal))}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span>Taxa de entrega</span>
              <span className="tabular-nums">{brl(Number(order.delivery_fee))}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg font-bold tabular-nums">
                {brl(Number(order.total))}
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Cliente" value={order.customer_name} />
          <Info label="Telefone" value={order.customer_phone} />
          <Info
            label="Forma de entrega"
            value={order.fulfillment_type === "Pickup" ? "Retirada em loja" : "Entrega"}
          />
          <Info label="Pagamento" value={paymentLabel(order.payment_method)} />
          {order.fulfillment_type === "Delivery" && (
            <Info label="Endereço de entrega" value={order.delivery_address ?? "—"} />
          )}
          {order.fulfillment_type === "Pickup" && (
            <Info label="Loja de retirada" value={storeName ?? "—"} />
          )}
          {order.customer_email && <Info label="E-mail" value={order.customer_email} />}
          {order.notes && <Info label="Observações" value={order.notes} />}
        </dl>

        <div className="mt-6 flex justify-end">
          <a
            href={`https://wa.me/55${order.customer_phone.replace(/\D/g, "").replace(/^55/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            Falar com o cliente no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
