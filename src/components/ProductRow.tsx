import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { QuantityStepper } from "./QuantityStepper";
import { useCart, unitPriceFor } from "@/lib/cart";
import { brl } from "@/lib/order";
import type { Product } from "@/lib/products";

export function ProductRow({ product }: { product: Product }) {
  const { add, mode, setDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const { price, wholesaleApplied } = unitPriceFor(product, qty, mode);

  return (
    <div className="flex flex-col gap-3 border-t border-border py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{brl(price)}</span> / {product.unit}
          {mode === "atacado" && !wholesaleApplied && (
            <span className="ml-1 text-xs">
              · atacado {brl(product.wholesale)} a partir de {product.wholesaleMin} {product.unit}
              {product.unit === "unidade" ? "s" : ""}
            </span>
          )}
          {wholesaleApplied && (
            <span className="ml-1 text-xs font-semibold text-primary">preço de atacado</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <QuantityStepper value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={() => {
            add(product.id, qty);
            setQty(1);
            setDrawerOpen(true);
            toast.success(`${product.name} adicionado ao carrinho`);
          }}
          className="btn-base btn-brand px-4 py-2 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}
