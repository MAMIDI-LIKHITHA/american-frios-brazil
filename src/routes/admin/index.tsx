import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Painel administrativo | América Frios" },
      {
        name: "description",
        content:
          "Painel interno da América Frios para acompanhar pedidos, produtos e lojas. Acesso restrito à equipe.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel administrativo | América Frios" },
      {
        property: "og:description",
        content: "Painel interno da América Frios para gestão de pedidos e produtos.",
      },
    ],
  }),
  component: AdminHomePage,
});

function AdminHomePage() {
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
    <section className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Painel administrativo
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? `Conectado como ${email}` : "Área restrita da equipe América Frios."}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Sair
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Em construção</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A gestão de pedidos e produtos será adicionada aqui. O acesso já está protegido: somente
          contas com permissão de administrador conseguem abrir esta página.
        </p>
      </div>
    </section>
  );
}
