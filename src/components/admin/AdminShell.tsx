import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/admin", label: "Painel" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/relatorios", label: "Relatórios" },
] as const;

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:flex lg:gap-8 lg:py-10">
      {/* Navegação */}
      <aside className="lg:w-56 lg:shrink-0">
        <p className="font-display text-lg font-bold text-foreground">América Frios</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {email ?? "Área restrita da equipe"}
        </p>
        <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-6 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "border-primary bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "border-border text-foreground hover:bg-accent" }}
              className="whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/admin/change-password"
            activeProps={{ className: "border-primary bg-primary text-primary-foreground" }}
            inactiveProps={{ className: "border-border text-foreground hover:bg-accent" }}
            className="whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors"
          >
            Alterar senha
          </Link>
          <button
            onClick={handleSignOut}
            className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent lg:mt-2"
          >
            Sair
          </button>
        </nav>
      </aside>

      <section className="mt-8 min-w-0 flex-1 lg:mt-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </section>
    </div>
  );
}

export function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function BarBreakdown({
  title,
  rows,
  formatValue,
}: {
  title: string;
  rows: { label: string; value: number }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-semibold tabular-nums">
                {formatValue ? formatValue(r.value) : r.value}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
