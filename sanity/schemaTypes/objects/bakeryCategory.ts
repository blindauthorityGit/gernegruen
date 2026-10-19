import { TagIcon } from "@sanity/icons/Tag";
import { defineArrayMember, defineField, defineType } from "sanity";

export const bakeryProduct = defineType({
  name: "bakeryProduct",
  title: "Backware",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({ name: "name", title: "Produktname", type: "string", validation: (rule) => rule.required().max(140) }),
    defineField({ name: "price", title: "Preis", type: "string", validation: (rule) => rule.required().max(40).custom((value) => {
      if (typeof value !== "string") return "Bitte einen Preis eingeben.";
      const numeric = value.replace(/^ab\s*/i, "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
      const price = Number(numeric);
      return Number.isFinite(price) && price > 0 || "Bitte einen gültigen Preis größer als 0 eingeben.";
    }) }),
    defineField({ name: "note", title: "Zusatzinformation", type: "string", validation: (rule) => rule.max(100) }),
    defineField({ name: "sourceNumber", title: "Artikelnummer aus Quelldatei", type: "string", description: "Optionale stabile Quellkennung für spätere Excel-Importe." }),
  ],
  preview: { select: { title: "name", price: "price" }, prepare: ({ title, price }) => ({ title, subtitle: price }) },
});

export const bakeryCategory = defineType({
  name: "bakeryCategory",
  title: "Backwarenkategorie",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({ name: "title", title: "Kategoriename", type: "string", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "products", title: "Produkte", type: "array", of: [defineArrayMember({ type: "bakeryProduct" })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { select: { title: "title", products: "products" }, prepare: ({ title, products }) => ({ title, subtitle: `${products?.length ?? 0} Produkte` }) },
});
