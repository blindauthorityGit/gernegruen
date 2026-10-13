import type { BakeryCategory } from "@/lib/weekly/types";

export type OrderableBakeryProduct = {
  id: string;
  name: string;
  note?: string;
  priceCents: number;
};

export type OrderableBakeryCategory = {
  id: string;
  title: string;
  products: OrderableBakeryProduct[];
};

function priceToCents(price: string | number) {
  if (typeof price === "number") {
    const cents = Math.round(price * 100);
    return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
  }
  const numeric = price.replace(/[^\d,.-]/g, "");
  const normalized = numeric.includes(",") ? numeric.replace(/\./g, "").replace(",", ".") : numeric;
  const value = Number.parseFloat(normalized);
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function toOrderableBakeryCategories(categories: BakeryCategory[]): OrderableBakeryCategory[] {
  return categories.map((category) => ({
    id: category._key,
    title: category.title,
    products: category.products.flatMap((product) => {
      const priceCents = priceToCents(product.price);
      return priceCents === null ? [] : [{
        id: `${category._key}:${product._key}`,
        name: product.name,
        note: product.note,
        priceCents,
      }];
    }),
  })).filter((category) => category.products.length > 0);
}
