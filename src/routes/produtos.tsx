import { createFileRoute } from "@tanstack/react-router";

import { CategoryCard } from "@/components/CategoryCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATEGORIES } from "@/lib/products";

const description =
  "Catálogo América Frios Palmas: frios, embutidos, suínos, frangos e espetinhos no atacado e varejo. Preços em breve — peça já pelo WhatsApp.";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Produtos | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/produtos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/produtos" }],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  return (
    <div className="container-page py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Catálogo</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">
        Nossos produtos: frios, embutidos, suínos, frangos e espetinhos
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Escolha os itens, ajuste as quantidades e finalize o pedido aqui no site — com entrega
        em Palmas ou retirada em uma das nossas lojas.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <ModeToggle />
        <p className="text-sm text-foreground/80">
          Preços de atacado aparecem automaticamente ao atingir a quantidade mínima de cada item.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.name} category={c} showProducts />
        ))}
      </div>


      <section className="mt-14 rounded-2xl bg-charcoal px-6 py-12 text-center text-cream">
        <h2 className="font-display text-2xl md:text-3xl">
          Precisa de um orçamento para atacado?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cream/75">
          Atendemos mercados, lanchonetes, restaurantes e revendedores em Palmas e região.
        </p>
        <WhatsAppButton
          size="lg"
          className="mt-6"
          message="Olá! Vim pelo site e gostaria de um orçamento de atacado."
        >
          Fale Conosco no WhatsApp
        </WhatsAppButton>
      </section>
    </div>
  );
}
