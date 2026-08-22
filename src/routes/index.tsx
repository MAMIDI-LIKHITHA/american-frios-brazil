import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Store, Users, Truck, Check, Quote } from "lucide-react";

import { CategoryCard } from "@/components/CategoryCard";
import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CATEGORIES } from "@/lib/products";
import { STORES, localBusinessSchema } from "@/lib/site";
// PLACEHOLDER IMAGE (IA) — substituir por foto real da loja.
import heroImg from "@/assets/loja-interior.jpg";

const description =
  "América Frios: atacado e varejo de frios, embutidos, suínos, frangos e espetinhos em Palmas - TO. 2 lojas, delivery rápido e pedidos pelo WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Início | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: localBusinessSchema().map((schema) => ({
      type: "application/ld+json",
      children: JSON.stringify(schema),
    })),
  }),
  component: Index,
});

const BADGES = [
  { icon: Star, label: "4,5 no Google (25+ avaliações)" },
  { icon: Store, label: "2 lojas em Palmas" },
  { icon: Users, label: "+20 mil seguidores no Instagram" },
  { icon: Truck, label: "Delivery rápido e seguro" },
];

const REASONS = [
  {
    title: "Preços justos, direto do atacado",
    text: "Compre no volume que precisar e pague preço de atacado, mesmo no varejo.",
  },
  {
    title: "Produtos sempre frescos e em estoque",
    text: "Reposição constante de frios, embutidos, suínos e frangos nas duas lojas.",
  },
  {
    title: "Atendimento próximo e atencioso",
    text: "Respondemos rápido no WhatsApp e ajudamos você a montar o pedido.",
  },
  {
    title: "2 lojas em Palmas",
    text: "305 Sul e 903 Sul — sempre tem uma unidade perto de você.",
  },
];

const REVIEWS = [
  "Os clientes destacam com frequência o preço justo e a confiança de encontrar o produto sempre em estoque.",
  "Quem compra sempre elogia a variedade de frios — a mussarela fatiada é citada como excelente custo-benefício.",
  "As avaliações descrevem um atendimento atencioso, com respostas rápidas às dúvidas sobre pedidos.",
];

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImg}
          alt="Interior de loja da América Frios com balcões refrigerados de frios e embutidos"
          width={1536}
          height={864}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/78" />
        <div className="container-page relative py-16 md:py-24">
          <p className="font-display text-sm font-semibold tracking-widest text-cream/70 uppercase">
            Atacado e Varejo · Palmas - TO
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
            América Frios | Qualidade e Tradição em Frios, Embutidos e Carnes em Palmas
          </h1>
          <p className="mt-5 max-w-2xl text-base text-cream/80 md:text-lg">
            Atacado e varejo com os melhores preços e produtos frescos todos os dias.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton size="lg" />
            <Link to="/lojas" className="btn-base bg-cream px-6 py-3.5 text-base text-charcoal hover:bg-cream/90">
              Ver Nossas Lojas
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BADGES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm font-semibold text-cream backdrop-blur"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Categorias */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Categorias</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">O que você encontra aqui</h2>
          </div>
          <Link to="/produtos" className="text-sm font-semibold text-primary hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Monte seu pedido online: escolha os produtos, defina entrega ou retirada e finalize em
          poucos cliques.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.name} category={c} />
          ))}
        </div>
      </section>

      {/* Por que */}
      <section className="border-y border-border bg-secondary/60 py-16">
        <div className="container-page">
          <h2 className="font-display text-2xl md:text-3xl">Por que a América Frios</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {REASONS.map((r) => (
              <div key={r.title} className="card-surface flex gap-4 p-6">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avaliações */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl md:text-3xl">O que dizem nossos clientes</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            <Star className="h-4 w-4" /> 4,5 · 25+ avaliações no Google
          </span>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <blockquote key={r} className="card-surface p-6">
              <Quote className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-foreground/85">{r}</p>
            </blockquote>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Resumos baseados em avaliações públicas de clientes no Google.
        </p>
      </section>

      {/* Lojas */}
      <section className="border-t border-border bg-secondary/60 py-16">
        <div className="container-page">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">Nossas lojas</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Encontre a loja mais próxima</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {STORES.map((s) => (
              <StoreCard key={s.slug} store={s} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-2xl md:text-3xl">
            Precisa de Frios e Embutidos de Qualidade?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
            Atendemos famílias, revendedores e estabelecimentos em Palmas e região. Delivery
            rápido e seguro.
          </p>
          <WhatsAppButton size="lg" className="mt-7">
            Fale Conosco no WhatsApp
          </WhatsAppButton>
        </div>
      </section>
    </div>
  );
}
