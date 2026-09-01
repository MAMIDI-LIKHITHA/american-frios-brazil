import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin";

function validatePassword(password: string): string | null {
  if (password.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
  if (!/[a-z]/.test(password)) return "A senha deve conter letra minúscula.";
  if (!/[A-Z]/.test(password)) return "A senha deve conter letra maiúscula.";
  if (!/[0-9]/.test(password)) return "A senha deve conter número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A senha deve conter um caractere especial.";
  return null;
}

export const Route = createFileRoute("/admin/change-password")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Alterar senha | América Frios" },
      { name: "description", content: "Alteração de senha da conta administrativa da América Frios." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Alterar senha | América Frios" },
      { property: "og:description", content: "Área restrita da equipe América Frios." },
    ],
  }),
  component: AdminChangePasswordPage,
});

function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const strengthError = validatePassword(newPassword);
    if (strengthError) {
      toast.error(strengthError);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não confere com a nova senha.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("current password")
          ? "Senha atual incorreta."
          : "Não foi possível alterar a senha. Tente novamente.",
      );
      return;
    }

    // Never keep passwords in state longer than needed.
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
    toast.success("Senha alterada com sucesso. Você continua conectado.");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">Alterar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina uma nova senha para sua conta de administrador.
        </p>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm text-foreground">
              Senha alterada com sucesso. Sua sessão continua ativa.
            </p>
            <button
              onClick={() => navigate({ to: "/admin" })}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Voltar ao painel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-foreground">
                Senha atual
              </label>
              <input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">
                Nova senha
              </label>
              <input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Mínimo de 10 caracteres, com maiúscula, minúscula, número e caractere especial.
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-foreground">
                Confirmar nova senha
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>

            <p className="text-center text-sm">
              <Link to="/admin" className="text-muted-foreground underline-offset-4 hover:underline">
                Voltar ao painel
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
