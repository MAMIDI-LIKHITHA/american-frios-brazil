import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import logo from "@/assets/logo.png.asset.json";
import { WhatsAppButton } from "./WhatsAppButton";
import { CartButton } from "./CartDrawer";


const NAV = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/lojas", label: "Nossas Lojas" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={logo.url}
            alt="América Frios"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full md:h-11 md:w-11"
          />
          <span className="font-display text-lg leading-none font-bold tracking-tight md:text-xl">
            América <span className="text-primary">Frios</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
              className="text-sm font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton size="sm" className="hidden sm:inline-flex">
            Pedir no WhatsApp
          </WhatsAppButton>
          <CartButton />

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="py-2.5 text-base font-semibold"
              >
                {item.label}
              </Link>
            ))}
            <WhatsAppButton size="sm" className="mt-3 w-full sm:hidden">
              Pedir no WhatsApp
            </WhatsAppButton>
          </nav>
        </div>
      )}
    </header>
  );
}
