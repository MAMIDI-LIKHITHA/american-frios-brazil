import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";

import { ModeToggle } from "@/components/ModeToggle";
import { QuantityStepper } from "@/components/QuantityStepper";
import { WaIcon } from "@/components/WhatsAppButton";
import { useCart } from "@/lib/cart";
import {
  PAYMENT_METHODS,
  brl,
  buildOrder,
  checkoutSchema,
  orderWhatsAppLink,
  type CheckoutData,
  type Order,
} from "@/lib/order";
import { persistOrder } from "@/lib/orders-db";
import { STORES } from "@/lib/site";

const description =
  "Finalize seu pedido de frios, embutidos, suínos, frangos e espetinhos na América Frios Palmas: entrega ou retirada em loja, Pix, dinheiro ou cartão.";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho e Pedido | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Carrinho e Pedido | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/carrinho" }],
  }),
  component: CarrinhoPage,
});

const emptyForm: CheckoutData = {
  name: "",
  phone: "",
  fulfillment: "entrega",
  address: "",
  storeSlug: STORES[0]?.slug ?? "",
  payment: "pix",
  note: "",
};

function CarrinhoPage() {
  const { lines, total, mode, setQty, remove, clear } = useCart();
  const [form, setForm] = useState<CheckoutData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Order | null>(null);

  const set = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const created = buildOrder(lines, mode, parsed.data);
    setOrder(created);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (order) return <Confirmation order={order} />;

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl md:text-4xl">Seu pedido</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Monte o pedido, escolha entrega ou retirada e finalize aqui mesmo no site. Enviamos
        também um resumo pelo WhatsApp para a nossa equipe confirmar tudo com você.
      </p>

      {lines.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-center">
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          <Link to="/produtos" className="btn-base btn-brand mt-5">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Itens */}
          <section className="card-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">Itens</h2>
              <ModeToggle />
            </div>
            <ul className="mt-4">
              {lines.map((l) => (
                <li key={l.product.id} className="border-t border-border py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {brl(l.unitPrice)} / {l.product.unit}
                        {l.wholesaleApplied && (
                          <span className="ml-1 font-semibold text-primary">atacado</span>
                        )}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums">{brl(l.subtotal)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <QuantityStepper
                      value={l.qty}
                      onChange={(n) => setQty(l.product.id, n)}
                      label={`Quantidade de ${l.product.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => remove(l.product.id)}
                      aria-label={`Remover ${l.product.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">
                Total ({mode === "atacado" ? "atacado" : "varejo"})
              </span>
              <span className="font-display text-2xl font-bold tabular-nums">{brl(total)}</span>
            </div>
            {/* NOTA INTERNA: preços placeholder — trocar pela tabela real da cliente. */}
            <p className="mt-2 text-xs text-muted-foreground">
              Valores de referência. A equipe confirma o total final (peso e disponibilidade) no
              WhatsApp.
            </p>
          </section>

          {/* Checkout */}
          <form onSubmit={submit} noValidate className="card-surface h-fit p-5">
            <h2 className="font-display text-lg font-bold">Seus dados</h2>

            <Field label="Nome completo" error={errors["name"]}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={80}
                autoComplete="name"
                className="input-field"
                placeholder="Ex.: Maria Souza"
              />
            </Field>

            <Field label="Telefone / WhatsApp" error={errors["phone"]}>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={20}
                inputMode="tel"
                autoComplete="tel"
                className="input-field"
                placeholder="(63) 9 9999-9999"
              />
            </Field>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Como quer receber?</legend>
              <div className="mt-2 flex gap-2">
                {(
                  [
                    { id: "entrega", label: "Entrega" },
                    { id: "retirada", label: "Retirar na loja" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={form.fulfillment === o.id}
                    onClick={() => set("fulfillment", o.id)}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      form.fulfillment === o.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground/75"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {form.fulfillment === "entrega" ? (
              <Field label="Endereço de entrega" error={errors["address"]}>
                <textarea
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="input-field"
                  placeholder="Quadra, rua, número, complemento e ponto de referência"
                />
              </Field>
            ) : (
              <Field label="Loja para retirada" error={errors["storeSlug"]}>
                <select
                  value={form.storeSlug ?? ""}
                  onChange={(e) => set("storeSlug", e.target.value)}
                  className="input-field"
                >
                  {STORES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} — {s.street}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Forma de pagamento</legend>
              <div className="mt-2 space-y-2">
                {PAYMENT_METHODS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                      form.payment === p.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={p.id}
                      checked={form.payment === p.id}
                      onChange={() => set("payment", p.id)}
                      className="mt-1 accent-[var(--primary)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-muted-foreground">{p.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {/* NOTA INTERNA: confirmar com a cliente as formas de pagamento aceitas. */}
            </fieldset>

            <Field label="Observações (opcional)">
              <textarea
                value={form.note ?? ""}
                onChange={(e) => set("note", e.target.value)}
                maxLength={300}
                rows={2}
                className="input-field"
                placeholder="Ex.: fatiar a mussarela fina, entregar após as 15h"
              />
            </Field>

            <button type="submit" className="btn-base btn-brand mt-5 w-full">
              Enviar pedido · {brl(total)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function Confirmation({ order }: { order: Order }) {
  const store = STORES.find((s) => s.slug === order.customer.storeSlug);
  const payment = PAYMENT_METHODS.find((p) => p.id === order.customer.payment)?.label;

  return (
    <div className="container-page py-12">
      <div className="card-surface mx-auto max-w-2xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-9 w-9 text-[var(--whatsapp)]" />
          <div>
            <h1 className="font-display text-2xl">Pedido recebido!</h1>
            <p className="text-sm text-muted-foreground">
              Número do pedido: <strong className="text-foreground">{order.number}</strong>
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Obrigado, {order.customer.name}. Nossa equipe vai confirmar seu pedido pelo telefone{" "}
          {order.customer.phone}. Envie também o resumo pelo WhatsApp para agilizar o atendimento.
        </p>

        <ul className="mt-6 border-t border-border">
          {order.items.map((i) => (
            <li
              key={i.name}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm"
            >
              <span>
                {i.qty} {i.unit}
                {i.unit === "unidade" && i.qty > 1 ? "s" : ""} · {i.name}
              </span>
              <span className="font-semibold tabular-nums">{brl(i.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Total ({order.mode === "atacado" ? "atacado" : "varejo"})
          </span>
          <span className="font-display text-2xl font-bold tabular-nums">{brl(order.total)}</span>
        </div>

        <dl className="mt-6 grid gap-2 rounded-xl bg-secondary p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">
              {order.customer.fulfillment === "entrega" ? "Entrega" : "Retirada"}
            </dt>
            <dd className="text-right font-medium">
              {order.customer.fulfillment === "entrega"
                ? order.customer.address
                : `${store?.name} — ${store?.street}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Pagamento</dt>
            <dd className="font-medium">{payment}</dd>
          </div>
          {order.customer.note && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Observações</dt>
              <dd className="text-right font-medium">{order.customer.note}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={orderWhatsAppLink(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-whatsapp flex-1"
          >
            <WaIcon />
            Enviar resumo no WhatsApp
          </a>
          <Link to="/produtos" className="btn-base btn-outline-brand flex-1">
            Fazer novo pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
