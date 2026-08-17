import type { Category } from "@/lib/products";
import { WhatsAppButton } from "./WhatsAppButton";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="card-surface flex flex-col overflow-hidden">
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
          Em breve
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold">{category.name}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>
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
        <WhatsAppButton
          size="sm"
          className="mt-auto w-full"
          message={`Olá! Vim pelo site e gostaria de saber mais sobre ${category.name}.`}
        />
      </div>
    </article>
  );
}
