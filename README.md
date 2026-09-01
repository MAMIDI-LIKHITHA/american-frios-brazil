# América Frios Digital

# LOVABLE WEBSITE BUILD PROMPT: AMÉRICA FRIOS



## PROJECT OVERVIEW

Build a clean, trustworthy wholesale/retail website (site content in Portuguese) for:

**América Frios – Atacado e Varejo de Frios, Embutidos, Suínos e Frangos**

Palmas, Tocantins, Brazil — 3 physical stores



Site goals:

- Establish credibility for a business currently living only on Instagram/Facebook (20.5K IG followers, no proper site)

- Make it dead simple for customers to find the nearest store and reach out via WhatsApp

- Prepare structure for a future online catalog once pricing is finalized

- Keep it lightweight — this is a wholesale/retail deli, not a restaurant; no online ordering flow needed yet



## BUSINESS INFORMATION



- **Business Name:** América Frios

- **Tagline (from Instagram bio):** "Produzindo os melhores alimentos para sua mesa"

- **Industry:** Atacado e Varejo — Frios, Embutidos, Suínos, Frangos, Espetinhos

- **Phone / WhatsApp:** +55 63 98402-1014

- **Email:** empoemporiofinanceiro2018@yahoo.com

- **Instagram:** @americafriospalmas (20.5K seguidores)

- **Facebook:** América Frios

- **Rating:** 4.5★ (25+ avaliações no Google)

- **Delivery:** "Delivery rápido e seguro" (per Instagram bio)



### Store Locations (3 branches)

1. **Loja 305 Sul (Matriz / Loja Principal)**

   Av. LO 5, Q. 205 Sul, Alameda 1, 11 — Plano Diretor Sul, Palmas - TO, 77015-000

2. **Loja 903 Sul**

   Alameda 11 — Plano Diretor Sul, Palmas - TO, 77017-282

3. **Loja Taquaralto**

   Rua T08, R. Santa Fé, Quadra 10, Lote 09, Palmas - TO, 77064-030

   *(Nota interna para o dev: confirmar horário e funcionamento atual desta unidade antes de publicar — não exibir como "fechado" a menos que confirmado.)*



Hours: **8h às 19h, todos os dias** (placeholder for demo — confirm actual hours per store with client before final publish; may vary by location).



Pricing: **not yet public.** All product/catalog sections must use a "Em breve" (Coming Soon) treatment — product names and categories can be listed, but no prices displayed. Every product card should have a clear "Peça pelo WhatsApp" CTA instead of an "add to cart" or price tag.



## DESIGN & BRANDING



### Design Style

- Clean, trustworthy, grocery/deli feel — not flashy, not "restaurant menu" styled

- Should feel established and professional (this business has real scale — 3 stores, 20K+ followers — the site should reflect that, not read like a startup)



### Logo

Client-provided logo: orange gradient circle mark with a stylized white "A" (two overlapping swoosh/peak shapes forming an "A"). Use this as the primary logo in the nav header and footer. Because it's a circular badge mark, pair it with the business name in text next to it in the nav (mark + "América Frios" wordmark), rather than relying on the icon alone to carry the brand. Favicon: use the mark alone, cropped to the circle.



### Color Palette

- Primary: Deep Red (#C1272D) — ties to fresh meat/deli branding

- Secondary: Warm Cream / Off-white background (#FAF6F0)

- Accent: Charcoal (#2B2B2B) for text and structure

- CTA Buttons: WhatsApp Green (#25D366) for all "Peça pelo WhatsApp" buttons — use the recognizable WhatsApp green specifically for contact CTAs to build trust/familiarity



### Typography

- Headings: Poppins or Montserrat (bold, clean, modern)

- Body: Inter or Open Sans



### Imagery

**For this demo: use AI-generated placeholder images** (Lovable's built-in image generation) for all product and store visuals — real photos will be swapped in once the client provides them. Generate:

- Close-up shots of cold cuts, cheeses, sliced meats (frios/embutidos)

- Espetinhos (skewers) display

- Store front/interior shots, generic deli/wholesale style

- Packaging/wholesale bulk shots to reinforce "atacado" credibility



*(Note: mark these as placeholder in code comments so they're easy to find and replace with real client photos later.)*



## SITE ARCHITECTURE



### Primary Pages

- `/` (Homepage)

- `/produtos` (Catalog — categories only, no prices, "Em breve")

- `/lojas` (All 3 store locations with maps)

- `/sobre` (About)

- `/contato`



### No online ordering flow — every CTA routes to WhatsApp (`https://wa.me/5563984021014`) with a pre-filled message where possible, e.g. `?text=Olá! Vim pelo site e gostaria de saber mais sobre os produtos.`



## NAVIGATION



**Desktop Nav:**

`[LOGO] | Início | Produtos | Nossas Lojas | Sobre | Contato | [Pedir no WhatsApp]`



**Footer (3 columns):**

- **Produtos:** Frios, Embutidos, Suínos, Frangos, Espetinhos

- **Lojas:** Loja 305 Sul (Principal), Loja 903 Sul, Loja Taquaralto

- **Empresa:** Sobre, Contato, Instagram, Facebook



## HOMEPAGE STRUCTURE



### Hero Section

**H1:** América Frios | Qualidade e Tradição em Frios, Embutidos e Carnes em Palmas

**Subheading:** Atacado e varejo com os melhores preços e produtos frescos todos os dias.



**CTAs:**

- [Peça pelo WhatsApp] (green, primary)

- [Ver Nossas Lojas]



**Trust badges:**

- ⭐ 4.5 no Google (25+ avaliações)

- 3 lojas em Palmas

- +20 mil seguidores no Instagram

- Delivery rápido e seguro



### Product Categories Grid

- Frios

- Embutidos

- Suínos

- Frangos

- Espetinhos



Each card: image + name + "Em breve" badge + "Peça pelo WhatsApp" button (no price shown).



### Why América Frios Section

- Preços justos, direto do atacado

- Produtos sempre frescos e em estoque

- Atendimento próximo e atencioso

- 3 lojas estrategicamente localizadas em Palmas



### Reviews / Social Proof Section

Paraphrased from real Google reviews (never verbatim):

- Customers consistently highlight fair pricing and reliable stock availability

- Regulars specifically praise the variety of cold cuts, especially the sliced mozzarella as excellent value

- Reviewers describe the service as attentive and responsive, including quick replies to order inquiries



### Store Locator Section

Card per store: name, address, hours (8h às 19h, todos os dias), embedded Google Map, [Como Chegar] button.



### CTA Section

"Precisa de Frios e Embutidos de Qualidade?"

[Fale Conosco no WhatsApp]



## SOBRE PAGE

- Brief history/positioning: wholesale + retail deli business serving Palmas

- Emphasize scale (3 stores) and community trust (20K+ IG following, 4.5★ rating)

- Photo grid of products/stores



## LOJAS PAGE

For each of the 3 stores:

- Name, full address, embedded map, "Como Chegar" (Google Maps directions link), WhatsApp CTA

- Flag internally: Loja Taquaralto — verify current operating status before final publish



## SEO REQUIREMENTS

- Title Tag: `[Página] | América Frios Palmas`

- Meta Description: unique, 150–160 characters, in Portuguese, including "frios," "embutidos," "Palmas," and store-area keywords

- Schema Markup: LocalBusiness (x3 for each store), AggregateRating

- NAP consistency across all 3 store listings



## PERFORMANCE

- Mobile-first (Instagram/WhatsApp traffic is overwhelmingly mobile)

- Lazy-loaded images

- Fast load — this audience is browsing on mobile data, not wifi



## OPEN ITEMS TO CONFIRM WITH CLIENT (SÂMIA) BEFORE GOING LIVE

1. Confirm actual operating hours per store (demo currently uses placeholder 8h–19h daily for all 3 — real hours may differ by location)

2. Current operating status of Loja Taquaralto (Google shows "permanently closed" — needs direct confirmation)

3. When pricing will be ready to publish (to swap "Em breve" for real catalog)

4. Real store/product photos to replace AI-generated demo imagery

Use the attached image as logo

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://american-frios-brazil.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d13f00af-23b7-42ba-852b-30b05a9e06cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
