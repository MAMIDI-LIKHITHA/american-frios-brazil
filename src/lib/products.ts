// PLACEHOLDER IMAGES: geradas por IA para o demo — substituir pelas fotos reais do cliente.
import frios from "@/assets/frios.jpg";
import embutidos from "@/assets/embutidos.jpg";
import suinos from "@/assets/suinos.jpg";
import frangos from "@/assets/frangos.jpg";
import espetinhos from "@/assets/espetinhos.jpg";

export type Category = {
  name: string;
  image: string;
  description: string;
  items: string[];
};

export const CATEGORIES: Category[] = [
  {
    name: "Frios",
    image: frios,
    description: "Queijos, mussarela fatiada, presunto e apresuntado, peito de peru.",
    items: ["Mussarela fatiada", "Presunto", "Apresuntado", "Queijo prato", "Peito de peru"],
  },
  {
    name: "Embutidos",
    image: embutidos,
    description: "Linguiças, salsichas, salames e mortadelas para o dia a dia e para revenda.",
    items: ["Linguiça toscana", "Linguiça calabresa", "Salsicha", "Salame", "Mortadela"],
  },
  {
    name: "Suínos",
    image: suinos,
    description: "Cortes suínos frescos: costelinha, pernil, lombo, bisteca e panceta.",
    items: ["Costelinha", "Pernil", "Lombo", "Bisteca", "Panceta"],
  },
  {
    name: "Frangos",
    image: frangos,
    description: "Frango inteiro e cortes: coxa, sobrecoxa, filé de peito e asinha.",
    items: ["Frango inteiro", "Coxa e sobrecoxa", "Filé de peito", "Asinha", "Coração"],
  },
  {
    name: "Espetinhos",
    image: espetinhos,
    description: "Espetinhos temperados de carne, frango, linguiça e queijo coalho.",
    items: ["Carne", "Frango", "Linguiça", "Queijo coalho", "Kafta"],
  },
];
