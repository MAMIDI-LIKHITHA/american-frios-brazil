import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { brl } from "@/lib/order";
import {
  FULFILLMENT_LABELS,
  STATUS_FLOW,
  STATUS_LABELS,
  fetchOrderItems,
  paymentLabel,
  type AdminOrder,
  type AdminStore,
  type OrderStatus,
} from "@/lib/orders-db";

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-blue-500/10 text-blue-700",
  preparing: "bg-amber-500/15 text-amber-700",
  ready: "bg-emerald-500/15 text-emerald-700",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Allowed transitions — matches the existing database status values exactly. */
export function allowedNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "completed" || current === "cancelled") return [];
  const idx = STATUS_FLOW.indexOf(current);
  const next = STATUS_FLOW.slice(idx + 1);
  return [...next, "cancelled"];
}

export function OrderDetail({
  order,
  store,
  onClose,
  onStatus,
  busy,
}: {
  order: AdminOrder;
  store: AdminStore | null;
  onClose: () => void;
  onStatus: (status: OrderStatus) => void;
  busy: boolean;
}) {
  const itemsQuery = useQuery({
    queryKey: ["admin-order-items", order.id],
    queryFn: () => fetchOrderItems(order.id),
  });
  const items = itemsQuery.data ?? [];
  const next = allowedNextStatuses(order.status);

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            {next.length === 0 ? (
              <span className="text-xs text-muted-foreground">Pedido finalizado.</span>
            ) : (
              next.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => onStatus(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    s === "cancelled"
                      ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border">
          {itemsQuery.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Carregando itens…</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum item registrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((i) => (
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
          <Info label="E-mail" value={order.customer_email ?? "—"} />
          <Info label="Tipo de pedido" value={order.order_type} />
          <Info
            label="Forma de entrega"
            value={FULFILLMENT_LABELS[order.fulfillment_type] ?? order.fulfillment_type}
          />
          <Info label="Pagamento" value={paymentLabel(order.payment_method)} />
          {order.fulfillment_type === "Delivery" ? (
            <Info label="Endereço de entrega" value={order.delivery_address ?? "—"} />
          ) : (
            <>
              <Info label="Loja de retirada" value={store?.name ?? "—"} />
              <Info label="Endereço da loja" value={store?.address ?? "—"} />
              <Info label="Telefone da loja" value={store?.phone ?? "—"} />
            </>
          )}
        </dl>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Observações do cliente
          </p>
          <p className="mt-1 whitespace-pre-line text-foreground">{order.notes || "Nenhuma."}</p>
        </div>

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
      <dd className="mt-1 break-words text-foreground">{value}</dd>
    </div>
  );
}
