import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label = "Quantidade",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background">
      <button
        type="button"
        aria-label={`Diminuir ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-primary"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={999}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(999, Math.max(min, Math.round(n))) : min);
        }}
        className="w-11 border-0 bg-transparent text-center text-sm font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Aumentar ${label.toLowerCase()}`}
        onClick={() => onChange(Math.min(999, value + 1))}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-primary"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
