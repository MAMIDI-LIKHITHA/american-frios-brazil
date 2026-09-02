import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";

import logo from "@/assets/logo.jpg";
import { CONTACT, STORES } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-charcoal text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="América Frios"
              width={44}
              height={44}
              loading="lazy"
              className="h-11 w-11 rounded-full"
            />
            <span className="font-display text-lg font-bold">América Frios</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            Produzindo os melhores alimentos para sua mesa. Atacado e varejo de frios,
            embutidos, suínos e frangos em Palmas - TO.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 hover:bg-cream/20"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 hover:bg-cream/20"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-cream">Produtos</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            {["Frios", "Embutidos", "Suínos", "Frangos", "Espetinhos"].map((p) => (
              <li key={p}>
                <Link to="/produtos" className="hover:text-cream">
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-cream">Lojas</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            {STORES.map((s) => (
              <li key={s.slug}>
                <Link to="/lojas" className="hover:text-cream">
                  {s.name}
                  {s.badge ? " (Principal)" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase text-cream">Empresa</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li>
              <Link to="/sobre" className="hover:text-cream">
                Sobre
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-cream">
                Contato
              </Link>
            </li>
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Instagram
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Facebook
              </a>
            </li>
          </ul>
          <div className="mt-5 space-y-2 text-sm text-cream/70">
            <a href={`tel:+${"5563984021014"}`} className="flex items-center gap-2 hover:text-cream">
              <Phone className="h-4 w-4" /> {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 break-all hover:text-cream">
              <Mail className="h-4 w-4 shrink-0" /> {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-5">
        <p className="container-page text-xs text-cream/50">
          © {new Date().getFullYear()} América Frios — Atacado e Varejo. Palmas, Tocantins.
        </p>
      </div>
    </footer>
  );
}
