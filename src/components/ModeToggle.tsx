import { useCart, type OrderMode } from "@/lib/cart";

const OPTIONS: { id: OrderMode; label: string }[] = [
  { id: "varejo", label: "Varejo" },
  { id: "atacado", label: "Atacado" },
];

export function ModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useCart();

  return (
    <div
      role="group"
      aria-label="Tipo de pedido"
      className={`inline-flex rounded-full border border-border bg-background p-1 ${className}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={mode === o.id}
          onClick={() => setMode(o.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            mode === o.id
              ? "bg-primary text-primary-foreground"
              : "text-foreground/70 hover:text-primary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
