import { supabase } from "@/integrations/supabase/client";

import { PAYMENT_METHODS } from "./order";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Novo",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const STATUS_FLOW: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

export function paymentLabel(id: string | null) {
  return PAYMENT_METHODS.find((p) => p.id === id)?.label ?? id ?? "—";
}

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: string;
  fulfillment_type: string;
  store_id: string | null;
  delivery_address: string | null;
  payment_method: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
};

export type AdminOrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export async function fetchAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminOrder[];
}

export async function fetchOrderItems(orderId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("id, product_name, quantity, unit_price, subtotal")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminOrderItem[];
}

export async function fetchStores() {
  const { data, error } = await supabase.from("stores").select("id, name, address");
  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export type AdminStore = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
};

export async function fetchAdminStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, address, phone")
    .order("name");
  if (error) throw error;
  return (data ?? []) as AdminStore[];
}

/** Orders created within [fromISO, toISO). Admin-only by RLS. */
export async function fetchOrdersRange(fromISO: string, toISO: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", fromISO)
    .lt("created_at", toISO)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminOrder[];
}

export type ReportItem = {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

/** Item snapshots for the given orders (historical name/price preserved). */
export async function fetchItemsForOrders(orderIds: string[]) {
  if (orderIds.length === 0) return [] as ReportItem[];
  const out: ReportItem[] = [];
  for (let i = 0; i < orderIds.length; i += 100) {
    const chunk = orderIds.slice(i, i + 100);
    const { data, error } = await supabase
      .from("order_items")
      .select("order_id, product_name, quantity, unit_price, subtotal")
      .in("order_id", chunk);
    if (error) throw error;
    out.push(...((data ?? []) as ReportItem[]));
  }
  return out;
}

export const FULFILLMENT_LABELS: Record<string, string> = {
  Pickup: "Retirada",
  Delivery: "Entrega",
};

export function ordersToCsv(orders: AdminOrder[], storeName: (id: string | null) => string) {
  const header = [
    "Pedido",
    "Data/Hora",
    "Cliente",
    "Telefone",
    "Tipo",
    "Entrega",
    "Loja",
    "Subtotal",
    "Taxa de entrega",
    "Total",
    "Pagamento",
    "Status",
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = orders.map((o) =>
    [
      o.order_number,
      new Date(o.created_at).toLocaleString("pt-BR"),
      o.customer_name,
      o.customer_phone,
      o.order_type,
      FULFILLMENT_LABELS[o.fulfillment_type] ?? o.fulfillment_type,
      storeName(o.store_id),
      Number(o.subtotal).toFixed(2).replace(".", ","),
      Number(o.delivery_fee).toFixed(2).replace(".", ","),
      Number(o.total).toFixed(2).replace(".", ","),
      paymentLabel(o.payment_method),
      STATUS_LABELS[o.status],
    ]
      .map(esc)
      .join(";"),
  );
  return [header.map(esc).join(";"), ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
