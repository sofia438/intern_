"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { addProduct, deleteProduct, updateProduct } from "@/app/actions/profile";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type SavedProduct = {
  id: string;
  name: string;
  englishName: string | null;
  hsCode: string | null;
  hasImage: boolean;
};

const fieldClass =
  "h-12 w-full border border-[#d5d7dd] bg-white px-4 text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100";

function ProductRow({ product }: { product: SavedProduct }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(updateProduct, undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state?.message && !state.errors) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="flex items-center gap-4 border-b border-[#ececec] py-4 last:border-0 dark:border-[#3a3a3a]">
        {product.hasImage ? (
          
          <img
            src={`/api/products/${product.id}/image`}
            alt={product.name}
            className="h-14 w-14 shrink-0 rounded border border-[#dfe2e7] object-cover dark:border-[#3a3a3a]"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded border border-dashed border-[#dfe2e7] dark:border-[#3a3a3a]" />
        )}
        <div className="min-w-0 flex-1">
          <strong className="block dark:text-white">{product.name}</strong>
          <small className="block text-neutral-500 dark:text-neutral-400">
            {product.englishName ? `${product.englishName} · ` : ""}
            {product.hsCode ? `HS ${product.hsCode}` : t.productsManager.noHsCode}
          </small>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          aria-label={`${t.productsManager.editProduct} ${product.name}`}
        >
          <Pencil size={18} />
        </button>
        <form action={deleteProduct}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="text-neutral-500 hover:text-red-600 dark:text-neutral-400" aria-label={`${t.productsManager.deleteProduct} ${product.name}`}>
            <Trash2 size={18} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="space-y-3 border-b border-[#ececec] py-4 last:border-0 dark:border-[#3a3a3a]"
    >
      <input type="hidden" name="productId" value={product.id} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="name" defaultValue={product.name} placeholder={t.productsManager.productNamePlaceholder} className={fieldClass} />
        <input name="englishName" defaultValue={product.englishName ?? ""} placeholder={t.productsManager.englishNamePlaceholder} className={fieldClass} />
        <input name="hsCode" defaultValue={product.hsCode ?? ""} placeholder={t.productsManager.hsCodePlaceholder} className={fieldClass} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#041B3A] file:px-4 file:py-2 file:font-bold file:text-white file:transition hover:file:bg-[#072955] dark:text-neutral-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
        >
          {pending ? t.productsManager.saving : t.common.save}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-sm font-bold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        >
          {t.productsManager.cancel}
        </button>
      </div>
      {state?.errors?.name && <p className="text-sm text-red-600 dark:text-red-400">{state.errors.name[0]}</p>}
      {state?.message && <p className="text-sm text-[#5b6300] dark:text-[#c7d400]">{state.message}</p>}
    </form>
  );
}

export default function ProductsManager({ products }: { products: SavedProduct[] }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(addProduct, undefined);
  const [adding, setAdding] = useState(products.length === 0);
  const [lastCount, setLastCount] = useState(products.length);

  useEffect(() => {
    if (products.length > lastCount) setAdding(false);
    setLastCount(products.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  return (
    <div>
      {products.length > 0 && (
        <div className="mb-2">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      )}

      {adding ? (
        <form action={action} className="space-y-3 rounded border border-[#dfe2e7] p-4 dark:border-[#3a3a3a]" key={products.length}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input name="name" placeholder={t.productsManager.productNamePlaceholder} className={fieldClass} />
            <input name="englishName" placeholder={t.productsManager.englishNamePlaceholder} className={fieldClass} />
            <input name="hsCode" placeholder={t.productsManager.hsCodePlaceholder} className={fieldClass} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
          type="file"
          name="image"
          accept="image/*"
          className="text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#041B3A] file:px-4 file:py-2 file:font-bold file:text-white file:transition hover:file:bg-[#072955] dark:text-neutral-400"
        />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
            >
              {pending ? t.productsManager.adding : t.productsManager.addProduct}
            </button>
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-sm font-bold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                {t.productsManager.cancel}
              </button>
            )}
          </div>
          {state?.errors?.name && <p className="text-sm text-red-600 dark:text-red-400">{state.errors.name[0]}</p>}
          {state?.message && <p className="text-sm text-[#5b6300] dark:text-[#c7d400]">{state.message}</p>}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 border border-[#07172b] px-4 py-2.5 text-sm font-bold text-[#07172b] hover:bg-neutral-50 dark:border-neutral-300 dark:text-neutral-100 dark:hover:bg-[#2e2e2e]"
        >
          <Plus size={16} /> {t.productsManager.addProduct}
        </button>
      )}
    </div>
  );
}
