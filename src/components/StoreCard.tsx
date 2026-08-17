import { Clock, MapPin, Navigation } from "lucide-react";

import { mapDirections, mapEmbed, type Store } from "@/lib/site";
import { WhatsAppButton } from "./WhatsAppButton";

export function StoreCard({ store }: { store: Store }) {
  return (
    <article className="card-surface overflow-hidden">
      <div className="aspect-16/10 w-full bg-muted">
        <iframe
          title={`Mapa — ${store.name}`}
          src={mapEmbed(store.mapQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold">{store.name}</h3>
          {store.badge && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {store.badge}
            </span>
          )}
        </div>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {store.street} — {store.district}, {store.city}, {store.postal}
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          {store.hours}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={mapDirections(store.mapQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-outline-brand px-4 py-2 text-sm"
          >
            <Navigation className="h-4 w-4" /> Como Chegar
          </a>
          <WhatsAppButton
            size="sm"
            message={`Olá! Vim pelo site e gostaria de falar com a ${store.name}.`}
          >
            Falar no WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
