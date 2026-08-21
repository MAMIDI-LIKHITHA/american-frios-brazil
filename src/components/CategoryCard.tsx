import { Link } from "@tanstack/react-router";

import type { Category } from "@/lib/products";
import { ProductRow } from "./ProductRow";
import { brl } from "@/lib/order";

export function CategoryCard({
  category,
  showProducts = false,
}: {
  category: Category;
  showProducts?: boolean;
}) {
  const from = Math.min(...category.products.map((p) => p.retail));

  return (
    <article className="card-surface flex flex-col overflow-hidden" id={category.slug}>
      {/* PLACEHOLDER IMAGE (IA) — substituir por foto real do cliente */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={category.image}
          alt={`${category.name} — América Frios`}
          width={1024}
          height={768}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          A partir de {brl(from)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold">{category.name}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>

        {showProducts ? (
          <div className="mt-1">
            {category.products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {category.items.map((i) => (
                <li
                  key={i}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {i}
                </li>
              ))}
            </ul>
            <Link
              to="/produtos"
              hash={category.slug}
              className="btn-base btn-brand mt-auto w-full px-4 py-2 text-sm"
            >
              Ver e pedir
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
