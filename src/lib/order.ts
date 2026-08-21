import { z } from "zod";

import type { DetailedLine, OrderMode } from "./cart";
import { STORES, WHATSAPP_NUMBER } from "./site";

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const PAYMENT_METHODS = [
  { id: "pix", label: "Pix", hint: "Enviamos a chave Pix pelo WhatsApp após o pedido." },
  { id: "dinheiro", label: "Dinheiro na entrega/retirada", hint: "Pague ao receber ou na loja." },
  { id: "cartao", label: "Cartão na entrega/retirada", hint: "Maquininha na entrega ou na loja." },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo").max(80, "Nome muito longo"),
    phone: z
      .string()
      .trim()
      .min(10, "Informe um telefone com DDD")
      .max(20, "Telefone inválido")
      .regex(/^[0-9()+\-\s]+$/, "Use apenas números, espaços e ( ) + -"),
    fulfillment: z.enum(["entrega", "retirada"]),
    address: z.string().trim().max(200, "Endereço muito longo").optional().or(z.literal("")),
    storeSlug: z.string().trim().max(40).optional().or(z.literal("")),
    payment: z.enum(["pix", "dinheiro", "cartao"]),
    note: z.string().trim().max(300, "Observação muito longa").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment === "entrega" && (!data.address || data.address.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Informe o endereço completo para entrega",
      });
    }
    if (data.fulfillment === "retirada" && !data.storeSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["storeSlug"],
        message: "Escolha a loja para retirada",
      });
    }
  });

export type CheckoutData = z.infer<typeof checkoutSchema>;

export type Order = {
  number: string;
  createdAt: string;
  mode: OrderMode;
  total: number;
  items: { name: string; qty: number; unit: string; unitPrice: number; subtotal: number }[];
  customer: CheckoutData;
};

export function newOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}`.slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `AF-${stamp}-${rand}`;
}

export function buildOrder(lines: DetailedLine[], mode: OrderMode, customer: CheckoutData): Order {
  return {
    number: newOrderNumber(),
    createdAt: new Date().toISOString(),
    mode,
    total: lines.reduce((n, l) => n + l.subtotal, 0),
    items: lines.map((l) => ({
      name: l.product.name,
      qty: l.qty,
      unit: l.product.unit,
      unitPrice: l.unitPrice,
      subtotal: l.subtotal,
    })),
    customer,
  };
}

export function orderWhatsAppLink(order: Order) {
  const store = STORES.find((s) => s.slug === order.customer.storeSlug);
  const payment = PAYMENT_METHODS.find((p) => p.id === order.customer.payment)?.label ?? "-";

  const lines = [
    `*Novo pedido pelo site — ${order.number}*`,
    `Tipo: ${order.mode === "atacado" ? "Atacado" : "Varejo"}`,
    "",
    "*Itens:*",
    ...order.items.map(
      (i) => `• ${i.qty} ${i.unit} — ${i.name} (${brl(i.unitPrice)}/${i.unit}) = ${brl(i.subtotal)}`,
    ),
    "",
    `*Total: ${brl(order.total)}*`,
    "",
    `Cliente: ${order.customer.name}`,
    `Telefone: ${order.customer.phone}`,
    order.customer.fulfillment === "entrega"
      ? `Entrega em: ${order.customer.address}`
      : `Retirada na: ${store?.name ?? "loja"}`,
    `Pagamento: ${payment}`,
    ...(order.customer.note ? [`Observações: ${order.customer.note}`] : []),
  ];

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
