import { Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2, X } from "lucide-react";

import { QuantityStepper } from "./QuantityStepper";
import { ModeToggle } from "./ModeToggle";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/order";

export function CartButton() {
  const { count, setDrawerOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Abrir carrinho (${count} itens)`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:text-primary"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { lines, total, drawerOpen, setDrawerOpen, setQty, remove, clear } = useCart();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-charcoal/50"
      />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold">Seu carrinho</h2>
          <button
            type="button"
            aria-label="Fechar carrinho"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-border px-5 py-3">
          <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Tipo de pedido
          </p>
          <ModeToggle />
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Seu carrinho está vazio. Escolha produtos no catálogo.
            </p>
          ) : (
            <ul>
              {lines.map((l) => (
                <li key={l.product.id} className="border-b border-border py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {brl(l.unitPrice)} / {l.product.unit}
                        {l.wholesaleApplied && (
                          <span className="ml-1 font-semibold text-primary">atacado</span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">{brl(l.subtotal)}</p>
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
          )}
        </div>

        <footer className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-xl font-bold tabular-nums">{brl(total)}</span>
          </div>
          <Link
            to="/carrinho"
            onClick={() => setDrawerOpen(false)}
            className={`btn-base btn-brand w-full ${lines.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          >
            Finalizar pedido
          </Link>
          <div className="flex items-center justify-between text-xs">
            <Link
              to="/produtos"
              onClick={() => setDrawerOpen(false)}
              className="font-semibold text-primary"
            >
              Continuar comprando
            </Link>
            {lines.length > 0 && (
              <button type="button" onClick={clear} className="text-muted-foreground underline">
                Limpar carrinho
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Preços de referência — a loja confirma valores e disponibilidade no WhatsApp.
          </p>
        </footer>
      </aside>
    </div>
  );
}
