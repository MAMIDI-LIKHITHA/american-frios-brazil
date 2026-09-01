import { supabase } from "@/integrations/supabase/client";

import { PAYMENT_METHODS } from "./order";
import type { Order } from "./order";
import { STORES } from "./site";

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

/** Persiste o pedido no banco. Falhas não bloqueiam a confirmação para o cliente. */
export async function persistOrder(order: Order): Promise<boolean> {
  try {
    let storeId: string | null = null;
    if (order.customer.fulfillment === "retirada") {
      const storeName = STORES.find((s) => s.slug === order.customer.storeSlug)?.name;
      if (storeName) {
        const { data } = await supabase
          .from("stores")
          .select("id")
          .eq("name", storeName)
          .maybeSingle();
        storeId = data?.id ?? null;
      }
    }

    const { data: created, error } = await supabase
      .from("orders")
      .insert({
        order_number: order.number,
        customer_name: order.customer.name,
        customer_phone: order.customer.phone,
        order_type: order.mode === "atacado" ? "Atacado" : "Varejo",
        fulfillment_type: order.customer.fulfillment === "retirada" ? "Pickup" : "Delivery",
        store_id: storeId,
        delivery_address:
          order.customer.fulfillment === "entrega" ? (order.customer.address ?? null) : null,
        payment_method: order.customer.payment,
        subtotal: order.total,
        delivery_fee: 0,
        total: order.total,
        status: "new",
        notes: order.customer.note || null,
      })
      .select("id")
      .single();

    if (error || !created) return false;

    const { error: itemsError } = await supabase.from("order_items").insert(
      order.items.map((i) => ({
        order_id: created.id,
        product_name: i.name,
        quantity: i.qty,
        unit_price: i.unitPrice,
        subtotal: i.subtotal,
      })),
    );
    return !itemsError;
  } catch {
    return false;
  }
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
