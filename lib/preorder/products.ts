import type { BakeryCategory } from "@/lib/weekly/types";

export type OrderableBakeryProduct = {
  id: string;
  name: string;
  note?: string;
  ingredients?: string;
  priceCents: number;
};

export type OrderableBakerySection = "bread" | "sweet";

export type OrderableBakeryCategory = {
  id: string;
  title: string;
  section: OrderableBakerySection;
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

export function toOrderableBakeryCategories(groups: {bread: BakeryCategory[]; sweet: BakeryCategory[]}): OrderableBakeryCategory[] {
  return ([
    ...groups.bread.map((category) => ({category, section: "bread" as const})),
    ...groups.sweet.map((category) => ({category, section: "sweet" as const})),
  ]).map(({category, section}) => ({
    id: category._key,
    title: category.title,
    section,
    products: category.products.flatMap((product) => {
      const priceCents = priceToCents(product.price);
      return priceCents === null ? [] : [{
        id: `${category._key}:${product._key}`,
        name: product.name,
        note: product.note,
        ingredients: product.ingredients,
        priceCents,
      }];
    }),
  })).filter((category) => category.products.length > 0);
}
