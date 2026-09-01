import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  beforeLoad: async () => {
    if (await isCurrentUserAdmin()) {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Acesso restrito | América Frios" },
      {
        name: "description",
        content:
          "Área administrativa da América Frios. Acesso restrito à equipe autorizada para gestão de pedidos e produtos.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso restrito | América Frios" },
      {
        property: "og:description",
        content: "Área administrativa da América Frios — acesso somente para a equipe autorizada.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      toast.error("Não foi possível entrar. Verifique e-mail e senha.");
      return;
    }

    if (!(await isCurrentUserAdmin())) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("Esta conta não tem permissão de administrador.");
      return;
    }

    setLoading(false);
    navigate({ to: "/admin", replace: true });
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">Área administrativa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesso restrito à equipe da América Frios.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-foreground">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Senha
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}
