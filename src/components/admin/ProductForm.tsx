import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  resolveProductImageUrl,
  saveProduct,
  uploadProductImage,
  type AdminProduct,
} from "@/lib/products-db";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

export function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? categories[0] ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : "");
  const [unit, setUnit] = useState<"kg" | "unidade">(
    product?.unit === "kg" ? "kg" : "unidade",
  );
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [active, setActive] = useState(product?.active ?? true);
  const [imagePath, setImagePath] = useState<string | null>(product?.image_url ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    void resolveProductImageUrl(imagePath).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [file, imagePath]);

  function handleFile(selected: File | undefined) {
    if (!selected) return;
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      toast.error("Imagem muito grande. Máximo de 5 MB.");
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const finalCategory = (newCategory.trim() || category).trim();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Informe o nome do produto.");
      return;
    }
    if (!finalCategory) {
      toast.error("Informe a categoria.");
      return;
    }

    const parsedPrice = price.trim() === "" ? null : Number(price.replace(",", "."));
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      toast.error("Preço inválido.");
      return;
    }

    setSaving(true);
    try {
      let finalImage = imagePath;
      if (file) finalImage = await uploadProductImage(file);

      await saveProduct({
        id: product?.id,
        name: trimmedName,
        category: finalCategory,
        description: description.trim() || null,
        price: parsedPrice,
        unit,
        image_url: finalImage,
        active,
        in_stock: inStock,
      });

      toast.success(product ? "Produto atualizado." : "Produto criado.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            {product ? "Editar produto" : "Novo produto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg border border-border p-2 text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Categoria</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Nova categoria (opcional)
            </span>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              maxLength={40}
              placeholder="Ex.: Queijos"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Descrição (opcional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Preço (R$)</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">Unidade</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "kg" | "unidade")}
              className={inputClass}
            >
              <option value="kg">R$ / kg</option>
              <option value="unidade">R$ / unidade</option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Imagem</span>
            <div className="mt-2 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="Pré-visualização" className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="text-sm text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WEBP — até 5 MB.</p>
                {(file || imagePath) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setImagePath(null);
                    }}
                    className="mt-2 text-xs font-semibold text-destructive"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-foreground">Em estoque</span>
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-foreground">
              Ativo (visível no catálogo)
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
