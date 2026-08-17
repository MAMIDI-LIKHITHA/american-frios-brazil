import { createFileRoute } from "@tanstack/react-router";
import { Store, Star, Users, Truck } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
// PLACEHOLDER IMAGES (IA) — substituir pelas fotos reais do cliente.
import interior from "@/assets/loja-interior.jpg";
import atacado from "@/assets/atacado.jpg";
import fachada from "@/assets/loja-fachada.jpg";
import frios from "@/assets/frios.jpg";
import espetinhos from "@/assets/espetinhos.jpg";
import embutidos from "@/assets/embutidos.jpg";

const description =
  "Conheça a América Frios: atacado e varejo de frios, embutidos, suínos e frangos em Palmas - TO, com 3 lojas, 4,5★ no Google e +20 mil seguidores.";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Sobre | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/sobre" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

const NUMBERS = [
  { icon: Store, label: "3 lojas em Palmas" },
  { icon: Star, label: "4,5★ no Google (25+ avaliações)" },
  { icon: Users, label: "+20 mil seguidores no Instagram" },
  { icon: Truck, label: "Delivery rápido e seguro" },
];

function SobrePage() {
  return (
    <div className="container-page py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Sobre nós</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">
        Produzindo os melhores alimentos para sua mesa
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="space-y-4 text-muted-foreground">
          <p>
            A América Frios é uma distribuidora e loja de frios, embutidos, carnes suínas e
            frangos em Palmas, Tocantins. Trabalhamos com atacado e varejo: atendemos tanto a
            família que quer abastecer a geladeira da semana quanto mercados, lanchonetes,
            restaurantes e revendedores que precisam de volume com preço justo.
          </p>
          <p>
            Hoje somos <strong className="text-foreground">3 lojas</strong> em pontos
            estratégicos da cidade — 305 Sul (nossa matriz), 903 Sul e Taquaralto — o que nos
            permite manter estoque constante e entregar rápido em toda Palmas.
          </p>
          <p>
            Essa presença é resultado da confiança de quem compra com a gente todos os dias:
            somos <strong className="text-foreground">4,5★ no Google</strong> e temos uma
            comunidade de mais de{" "}
            <strong className="text-foreground">20 mil seguidores no Instagram</strong>, onde
            divulgamos novidades e ofertas da semana.
          </p>
          <p>
            Nosso compromisso é simples: produto fresco, preço de atacado e atendimento
            próximo — pelo WhatsApp, no balcão ou no delivery.
          </p>
          <WhatsAppButton className="mt-2" size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[interior, atacado, fachada, frios, espetinhos, embutidos].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="América Frios — produtos e lojas"
              width={1024}
              height={768}
              loading="lazy"
              className={`h-full w-full rounded-xl object-cover ${i === 0 ? "col-span-2 aspect-16/9" : "aspect-square"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map(({ icon: Icon, label }) => (
          <div key={label} className="card-surface flex items-center gap-3 p-5">
            <Icon className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
