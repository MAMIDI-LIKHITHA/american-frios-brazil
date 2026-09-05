import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { isCurrentUserAdmin } from "@/lib/admin";
import { brl } from "@/lib/order";
import {
  PRODUCT_CATEGORIES,
  fetchAdminProducts,
  resolveProductImageUrl,
  type AdminProduct,
} from "@/lib/products-db";

export const Route = createFileRoute("/admin/produtos")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Produtos | Painel América Frios" },
      {
        name: "description",
        content: "Catálogo de produtos da América Frios: consulta, filtros e status.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Produtos | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita com o catálogo de produtos da América Frios.",
      },
    ],
  }),
  component: AdminProductsPage,
});

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "created-desc"
  | "created-asc";

function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });
  const products = productsQuery.data ?? [];

  useEffect(() => {
    if (products.length === 0) return;

    let cancelled = false;
    const storagePaths = products
      .filter((p) => p.image_url && !/^https?:\/\//i.test(p.image_url))
      .map((p) => p.id);

    if (storagePaths.length === 0) {
      const external: Record<string, string | null> = {};
      products.forEach((p) => {
        external[p.id] = p.image_url;
      });
      setImageUrls(external);
      return;
    }

    void (async () => {
      const map: Record<string, string | null> = {};
      await Promise.all(
        products.map(async (p) => {
          map[p.id] = await resolveProductImageUrl(p.image_url);
        }),
      );
      if (!cancelled) setImageUrls(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [products]);

  const categories = useMemo(() => {
    const dynamic = new Set(products.map((p) => p.category));
    return Array.from(new Set([...PRODUCT_CATEGORIES, ...dynamic])).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [products]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name, "pt-BR");
        case "name-desc":
          return b.name.localeCompare(a.name, "pt-BR");
        case "price-asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc":
          return (b.price ?? 0) - (a.price ?? 0);
        case "created-desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "created-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return list;
  }, [products, search, category, sort]);

  const selectClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

  return (
    <AdminShell
      title="Produtos"
      subtitle="Catálogo completo: estoque, ativação e preços."
      actions={
        <button
          onClick={() => void productsQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Atualizar
        </button>
      }
    >
      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="sm:col-span-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Buscar</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome do produto"
            className={`mt-1 ${selectClass}`}
          />
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Categoria</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`mt-1 ${selectClass}`}
          >
            <option value="all">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Ordenar</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className={`mt-1 ${selectClass}`}
          >
            <option value="name-asc">Nome A–Z</option>
            <option value="name-desc">Nome Z–A</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="created-desc">Mais recentes</option>
            <option value="created-asc">Mais antigos</option>
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {visible.length} produto(s) exibido(s) de {products.length}.
      </p>

      {productsQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando produtos…</p>
      ) : productsQuery.isError ? (
        <p className="mt-6 text-sm text-destructive">
          Não foi possível carregar os produtos. Tente atualizar a página.
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Nenhum produto encontrado com os filtros atuais.
        </p>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Imagem</th>
                  <th className="px-3 py-3">Nome</th>
                  <th className="px-3 py-3">Categoria</th>
                  <th className="px-3 py-3">Preço / unidade</th>
                  <th className="px-3 py-3">Estoque</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <ProductThumbnail id={p.id} url={imageUrls[p.id]} name={p.name} />
                    </td>
                    <td className="px-3 py-3 font-semibold">{p.name}</td>
                    <td className="px-3 py-3">{p.category}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {p.price != null ? (
                        <>
                          {brl(p.price)} <span className="text-muted-foreground">/ {p.unit}</span>
                        </>
                      ) : (
                      "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StockBadge inStock={p.in_stock} />
                    </td>
                    <td className="px-3 py-3">
                      <ActiveBadge active={p.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 lg:hidden">
            {visible.map((p) => (
              <div
                key={p.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="shrink-0">
                  <ProductThumbnail id={p.id} url={imageUrls[p.id]} name={p.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.category}</p>
                  <p className="mt-1 text-sm tabular-nums">
                    {p.price != null ? (
                      <>
                        {brl(p.price)} <span className="text-muted-foreground">/ {p.unit}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StockBadge inStock={p.in_stock} />
                    <ActiveBadge active={p.active} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}

function ProductThumbnail({ id, url, name }: { id: string; url: string | null | undefined; name: string }) {
  if (!url) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="h-14 w-14 rounded-xl object-cover"
      loading="lazy"
    />
  );
}

function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        inStock
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
      }`}
    >
      {inStock ? "Em estoque" : "Fora de estoque"}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}
