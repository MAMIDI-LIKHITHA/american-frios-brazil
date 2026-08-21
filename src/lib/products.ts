// PLACEHOLDER IMAGES: geradas por IA para o demo — substituir pelas fotos reais do cliente.
import frios from "@/assets/frios.jpg";
import embutidos from "@/assets/embutidos.jpg";
import suinos from "@/assets/suinos.jpg";
import frangos from "@/assets/frangos.jpg";
import espetinhos from "@/assets/espetinhos.jpg";

export type Product = {
  id: string;
  name: string;
  unit: string;
  /** PREÇO PLACEHOLDER (demo) — confirmar tabela real com a cliente antes de publicar. */
  retail: number;
  /** PREÇO PLACEHOLDER de atacado (demo) — válido a partir de `wholesaleMin` unidades. */
  wholesale: number;
  wholesaleMin: number;
  category: string;
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  description: string;
  items: string[];
  products: Product[];
};

// NOTA INTERNA: todos os preços abaixo são PLACEHOLDER para demonstração do carrinho.
const raw: Omit<Category, "items" | "products">[] & { products?: never }[] = [];
void raw;

function cat(
  slug: string,
  name: string,
  image: string,
  description: string,
  products: Omit<Product, "category">[],
): Category {
  return {
    slug,
    name,
    image,
    description,
    items: products.map((p) => p.name),
    products: products.map((p) => ({ ...p, category: name })),
  };
}

export const CATEGORIES: Category[] = [
  cat(
    "espetinhos",
    "Espetinhos",
    espetinhos,
    "Espetinhos temperados de carne, frango, linguiça e queijo coalho.",
    [
      { id: "esp-carne", name: "Espetinho de carne", unit: "unidade", retail: 7.5, wholesale: 5.9, wholesaleMin: 20 },
      { id: "esp-frango", name: "Espetinho de frango", unit: "unidade", retail: 6.5, wholesale: 5.2, wholesaleMin: 20 },
      { id: "esp-linguica", name: "Espetinho de linguiça", unit: "unidade", retail: 6.9, wholesale: 5.5, wholesaleMin: 20 },
      { id: "esp-coalho", name: "Espetinho de queijo coalho", unit: "unidade", retail: 8.9, wholesale: 7.2, wholesaleMin: 20 },
      { id: "esp-kafta", name: "Espetinho de kafta", unit: "unidade", retail: 7.9, wholesale: 6.4, wholesaleMin: 20 },
    ],
  ),
  cat("frios", "Frios", frios, "Queijos, mussarela fatiada, presunto e apresuntado, peito de peru.", [
    { id: "fri-mussarela", name: "Mussarela fatiada", unit: "kg", retail: 44.9, wholesale: 38.9, wholesaleMin: 3 },
    { id: "fri-presunto", name: "Presunto", unit: "kg", retail: 34.9, wholesale: 29.9, wholesaleMin: 3 },
    { id: "fri-apresuntado", name: "Apresuntado", unit: "kg", retail: 26.9, wholesale: 22.5, wholesaleMin: 3 },
    { id: "fri-prato", name: "Queijo prato", unit: "kg", retail: 46.9, wholesale: 40.9, wholesaleMin: 3 },
    { id: "fri-peru", name: "Peito de peru", unit: "kg", retail: 49.9, wholesale: 43.9, wholesaleMin: 3 },
  ]),
  cat("embutidos", "Embutidos", embutidos, "Linguiças, salsichas, salames e mortadelas para o dia a dia e para revenda.", [
    { id: "emb-toscana", name: "Linguiça toscana", unit: "kg", retail: 24.9, wholesale: 20.9, wholesaleMin: 5 },
    { id: "emb-calabresa", name: "Linguiça calabresa", unit: "kg", retail: 27.9, wholesale: 23.5, wholesaleMin: 5 },
    { id: "emb-salsicha", name: "Salsicha", unit: "kg", retail: 15.9, wholesale: 12.9, wholesaleMin: 5 },
    { id: "emb-salame", name: "Salame", unit: "kg", retail: 54.9, wholesale: 47.9, wholesaleMin: 3 },
    { id: "emb-mortadela", name: "Mortadela", unit: "kg", retail: 19.9, wholesale: 16.5, wholesaleMin: 5 },
  ]),
  cat("suinos", "Suínos", suinos, "Cortes suínos frescos: costelinha, pernil, lombo, bisteca e panceta.", [
    { id: "sui-costelinha", name: "Costelinha suína", unit: "kg", retail: 29.9, wholesale: 25.9, wholesaleMin: 5 },
    { id: "sui-pernil", name: "Pernil", unit: "kg", retail: 27.9, wholesale: 23.9, wholesaleMin: 5 },
    { id: "sui-lombo", name: "Lombo", unit: "kg", retail: 32.9, wholesale: 28.5, wholesaleMin: 5 },
    { id: "sui-bisteca", name: "Bisteca", unit: "kg", retail: 26.9, wholesale: 22.9, wholesaleMin: 5 },
    { id: "sui-panceta", name: "Panceta", unit: "kg", retail: 34.9, wholesale: 29.9, wholesaleMin: 5 },
  ]),
  cat("frangos", "Frangos", frangos, "Frango inteiro e cortes: coxa, sobrecoxa, filé de peito e asinha.", [
    { id: "fra-inteiro", name: "Frango inteiro", unit: "kg", retail: 13.9, wholesale: 11.5, wholesaleMin: 10 },
    { id: "fra-coxa", name: "Coxa e sobrecoxa", unit: "kg", retail: 14.9, wholesale: 12.4, wholesaleMin: 10 },
    { id: "fra-file", name: "Filé de peito", unit: "kg", retail: 24.9, wholesale: 21.5, wholesaleMin: 10 },
    { id: "fra-asinha", name: "Asinha", unit: "kg", retail: 19.9, wholesale: 16.9, wholesaleMin: 10 },
    { id: "fra-coracao", name: "Coração", unit: "kg", retail: 22.9, wholesale: 19.5, wholesaleMin: 10 },
  ]),
];

export const ALL_PRODUCTS: Product[] = CATEGORIES.flatMap((c) => c.products);

export const findProduct = (id: string) => ALL_PRODUCTS.find((p) => p.id === id);
