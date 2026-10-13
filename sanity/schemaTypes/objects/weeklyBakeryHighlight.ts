import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

export const weeklyBakeryHighlight = defineType({
  name: "weeklyBakeryHighlight",
  title: "Backwaren-Highlight",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({ name: "title", title: "Art", type: "string", options: { list: ["Brot der Woche", "Kuchen der Woche"], layout: "radio" }, validation: (rule) => rule.required() }),
    defineField({ name: "name", title: "Produktname", type: "string", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "description", title: "Kurzbeschreibung", type: "text", rows: 3, validation: (rule) => rule.required().max(260) }),
    defineField({ name: "price", title: "Preis in Euro", type: "number", validation: (rule) => rule.positive().precision(2) }),
    defineField({ name: "image", title: "Bild", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
    defineField({ name: "imageAlt", title: "Bildbeschreibung", type: "string", validation: (rule) => rule.required().max(160) }),
  ],
  preview: { select: { title: "name", subtitle: "title", media: "image" } },
});
