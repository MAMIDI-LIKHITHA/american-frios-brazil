import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

const itemSchema = z.object({
  slug: z.string().trim().min(1).max(60),
  qty: z.number().positive().max(1000),
});

const payloadSchema = z.object({
  mode: z.enum(["varejo", "atacado"]),
  items: z.array(itemSchema).min(1, "Carrinho vazio").max(60),
  customer: z.object({
    name: z.string().trim().min(3).max(80),
    phone: z
      .string()
      .trim()
      .min(10)
      .max(20)
      .regex(/^[0-9()+\-\s]+$/),
    fulfillment: z.enum(["entrega", "retirada"]),
    address: z.string().trim().max(200).optional(),
    storeName: z.string().trim().max(80).optional(),
    payment: z.enum(["pix", "dinheiro", "cartao"]),
    note: z.string().trim().max(300).optional(),
  }),
});

export type CreateOrderPayload = z.infer<typeof payloadSchema>;

export type CreateOrderResult =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      items: { name: string; qty: number; unit: string; unitPrice: number; subtotal: number }[];
    }
  | { ok: false; message: string };

function serverClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function orderNumber() {
  const now = new Date();
  const stamp =
    `${now.getFullYear()}` +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `AF-${stamp}-${rand}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    const supabase = serverClient();
    const { customer, items, mode } = data;

    if (customer.fulfillment === "entrega" && (customer.address ?? "").trim().length < 10) {
      return { ok: false, message: "Informe o endereço completo para entrega." };
    }
    if (customer.fulfillment === "retirada" && !customer.storeName) {
      return { ok: false, message: "Escolha a loja para retirada." };
    }

    // Preços SEMPRE vindos do banco — nunca do navegador.
    const slugs = [...new Set(items.map((i) => i.slug))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, slug, name, unit, price, wholesale_price, wholesale_min, available")
      .in("slug", slugs);

    if (productsError) return { ok: false, message: "Não foi possível validar os produtos." };

    const byQty = new Map<string, number>();
    for (const i of items) byQty.set(i.slug, (byQty.get(i.slug) ?? 0) + i.qty);

    const lines: {
      productId: string;
      name: string;
      unit: string;
      qty: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const [slug, qty] of byQty) {
      const product = (products ?? []).find((p) => p.slug === slug);
      if (!product || !product.available) {
        return { ok: false, message: `Produto indisponível: ${slug}. Revise o carrinho.` };
      }
      const retail = Number(product.price ?? 0);
      const wholesale = Number(product.wholesale_price ?? retail);
      const wholesaleMin = Number(product.wholesale_min ?? 1);
      const unitPrice =
        mode === "atacado" && qty >= wholesaleMin && wholesale > 0 ? wholesale : retail;
      if (!(unitPrice > 0)) {
        return { ok: false, message: `Preço indisponível para ${product.name}.` };
      }
      lines.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        qty,
        unitPrice: round2(unitPrice),
        subtotal: round2(unitPrice * qty),
      });
    }

    const subtotal = round2(lines.reduce((n, l) => n + l.subtotal, 0));
    const deliveryFee = 0;
    const total = round2(subtotal + deliveryFee);

    let storeId: string | null = null;
    if (customer.fulfillment === "retirada" && customer.storeName) {
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("name", customer.storeName)
        .maybeSingle();
      storeId = store?.id ?? null;
    }

    // Pix NÃO marca o pedido como pago: todo pedido nasce com status "new".
    let created: { id: string; order_number: string } | null = null;
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const number = orderNumber();
      const { data: row, error } = await supabase
        .from("orders")
        .insert({
          order_number: number,
          customer_name: customer.name,
          customer_phone: customer.phone,
          order_type: mode === "atacado" ? "Atacado" : "Varejo",
          fulfillment_type: customer.fulfillment === "retirada" ? "Pickup" : "Delivery",
          store_id: storeId,
          delivery_address: customer.fulfillment === "entrega" ? (customer.address ?? null) : null,
          payment_method: customer.payment,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: "new",
          notes: customer.note || null,
        })
        .select("id, order_number")
        .single();

      if (row) created = row;
      else lastError = error?.message ?? "erro desconhecido";
    }

    if (!created) {
      console.error("Falha ao criar pedido:", lastError);
      return { ok: false, message: "Não foi possível registrar o pedido. Tente novamente." };
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: created.id,
        product_id: l.productId,
        product_name: l.name,
        quantity: l.qty,
        unit_price: l.unitPrice,
        subtotal: l.subtotal,
      })),
    );

    if (itemsError) {
      console.error("Falha ao criar itens do pedido:", itemsError.message);
      return { ok: false, message: "Não foi possível registrar os itens do pedido." };
    }

    return {
      ok: true,
      orderNumber: created.order_number,
      total,
      items: lines.map((l) => ({
        name: l.name,
        qty: l.qty,
        unit: l.unit,
        unitPrice: l.unitPrice,
        subtotal: l.subtotal,
      })),
    };
  });
