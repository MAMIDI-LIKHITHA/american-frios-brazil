export const WHATSAPP_NUMBER = "5563984021014";

export const waLink = (
  text = "Olá! Vim pelo site e gostaria de saber mais sobre os produtos.",
) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const CONTACT = {
  phoneDisplay: "(63) 98402-1014",
  phoneIntl: "+55 63 98402-1014",
  email: "empoemporiofinanceiro2018@yahoo.com",
  instagram: "https://www.instagram.com/americafriospalmas/",
  instagramHandle: "@americafriospalmas",
  facebook: "https://www.facebook.com/search/top?q=am%C3%A9rica%20frios",
  hours: "8h às 19h, todos os dias",
};

export type Store = {
  slug: string;
  name: string;
  badge?: string;
  street: string;
  district: string;
  city: string;
  postal: string;
  mapQuery: string;
  // NOTA INTERNA: horários são placeholder (8h–19h) — confirmar por loja antes de publicar.
  hours: string;
  // NOTA INTERNA: verificar status de funcionamento desta unidade antes de publicar.
  verifyStatus?: boolean;
};

export const STORES: Store[] = [
  {
    slug: "305-sul",
    name: "Loja 305 Sul",
    badge: "Matriz",
    street: "Av. LO 5, Q. 205 Sul, Alameda 1, 11",
    district: "Plano Diretor Sul",
    city: "Palmas - TO",
    postal: "77015-000",
    mapQuery:
      "Av. LO 5, Q. 205 Sul, Alameda 1, 11, Plano Diretor Sul, Palmas - TO, 77015-000",
    hours: "8h às 19h, todos os dias",
  },
  {
    slug: "903-sul",
    name: "Loja 903 Sul",
    street: "Alameda 11, Q. 903 Sul",
    district: "Plano Diretor Sul",
    city: "Palmas - TO",
    postal: "77017-282",
    mapQuery: "Alameda 11, Quadra 903 Sul, Plano Diretor Sul, Palmas - TO, 77017-282",
    hours: "8h às 19h, todos os dias",
  },
  {
    slug: "taquaralto",
    name: "Loja Taquaralto",
    street: "Rua T08, R. Santa Fé, Quadra 10, Lote 09",
    district: "Taquaralto",
    city: "Palmas - TO",
    postal: "77064-030",
    mapQuery:
      "Rua T08, Rua Santa Fé, Quadra 10, Lote 09, Taquaralto, Palmas - TO, 77064-030",
    hours: "8h às 19h, todos os dias",
    verifyStatus: true,
  },
];

export const mapEmbed = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

export const mapDirections = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export const localBusinessSchema = () =>
  STORES.map((s) => ({
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: `América Frios — ${s.name}`,
    image: "https://www.instagram.com/americafriospalmas/",
    telephone: CONTACT.phoneIntl,
    email: CONTACT.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: "Palmas",
      addressRegion: "TO",
      postalCode: s.postal,
      addressCountry: "BR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "19:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "25",
    },
    sameAs: [CONTACT.instagram],
  }));
