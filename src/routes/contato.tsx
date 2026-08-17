import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, Instagram, Facebook, Clock, MapPin } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CONTACT, STORES, mapDirections } from "@/lib/site";

const description =
  "Fale com a América Frios Palmas: WhatsApp (63) 98402-1014, e-mail e endereços das 3 lojas de frios, embutidos, suínos e frangos em Palmas - TO.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Contato | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contato" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="container-page py-14">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">Contato</p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl md:text-4xl">
        Fale com a América Frios
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        O jeito mais rápido de falar com a gente é pelo WhatsApp: tiramos dúvidas, confirmamos
        estoque e passamos valores de atacado e varejo.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card-surface space-y-5 p-6">
          <h2 className="font-display text-xl">Atendimento</h2>
          <a
            href={`tel:+5563984021014`}
            className="flex items-center gap-3 text-sm font-semibold hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" /> {CONTACT.phoneDisplay}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-3 text-sm font-semibold break-all hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" /> {CONTACT.email}
          </a>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" /> {CONTACT.hours}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline-brand px-4 py-2 text-sm"
            >
              <Instagram className="h-4 w-4" /> {CONTACT.instagramHandle}
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline-brand px-4 py-2 text-sm"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
          </div>
          <WhatsAppButton size="lg" className="w-full" />
        </div>

        <div className="card-surface space-y-5 p-6">
          <h2 className="font-display text-xl">Nossas lojas</h2>
          {/* NOTA INTERNA: confirmar horários por unidade e status da Loja Taquaralto antes de publicar. */}
          {STORES.map((s) => (
            <div key={s.slug} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-display font-bold">
                {s.name}
                {s.badge ? ` — ${s.badge}` : ""}
              </p>
              <p className="mt-1 flex gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {s.street} — {s.district}, {s.city}, {s.postal}
                </span>
              </p>
              <a
                href={mapDirections(s.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Como Chegar →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
