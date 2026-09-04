import { supabase } from "@/integrations/supabase/client";

export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | null;
  unit: string;
  image_url: string | null;
  active: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
};

export const PRODUCT_CATEGORIES = [
  "Frios",
  "Embutidos",
  "Suínos",
  "Frangos",
  "Espetinhos",
] as const;

export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price, unit, image_url, active, in_stock, created_at, updated_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

/** Returns a usable image URL. External URLs are used as-is; storage paths
 *  are converted into a short-lived signed URL because the bucket is private. */
export async function resolveProductImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUrl(imageUrl, 3600);
  if (error) {
    // Fail closed: show placeholder instead of leaking storage errors.
    return null;
  }
  return data?.signedUrl ?? null;
}
