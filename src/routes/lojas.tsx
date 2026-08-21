import { createFileRoute } from "@tanstack/react-router";

import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { STORES, localBusinessSchema } from "@/lib/site";

const description =
  "Nossas 2 lojas em Palmas - TO: 305 Sul (matriz) e 903 Sul. Frios, embutidos e carnes no atacado e varejo, com mapa e rota.";

export const Route = createFileRoute("/lojas")({
  head: () => ({
    meta: [
      { title: "Nossas Lojas | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Nossas Lojas | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/lojas" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/lojas" }],
    scripts: localBusinessSchema().map((schema) => ({
      type: "application/ld+json",
      children: JSON.stringify(schema),
    })),
  }),
  component: LojasPage,
});

function LojasPage() {
  return (
    <div className="container-page py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Onde estamos</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">
        2 lojas América Frios em Palmas - TO
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Escolha a unidade mais próxima, veja o mapa e traçe a rota. Delivery rápido e seguro
        para Palmas e região.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {STORES.map((s) => (
          <StoreCard key={s.slug} store={s} />
        ))}
      </div>

      <section className="mt-14 card-surface flex flex-col items-center gap-4 p-8 text-center">
        <h2 className="font-display text-2xl">Não sabe qual loja tem o que você procura?</h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Mande uma mensagem: confirmamos estoque e preço na hora.
        </p>
        <WhatsAppButton size="lg" message="Olá! Vim pelo site e queria confirmar estoque em uma das lojas." />
      </section>
    </div>
  );
}
