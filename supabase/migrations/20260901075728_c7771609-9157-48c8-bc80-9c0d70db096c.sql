ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS wholesale_min NUMERIC(10,3) NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);