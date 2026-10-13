import {BasketIcon} from "@sanity/icons/Basket"
import {defineField, defineType} from "sanity"

export const nextWeekProduct = defineType({
  name: "nextWeekProduct",
  title: "Vorschauprodukt",
  type: "object",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "name",
      title: "Produktname",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "image",
      title: "Produktbild",
      type: "image",
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Optionaler, konkreter Produktzusatz. Herkunfts- oder Umweltangaben nur mit eindeutigem Produktbezug und prüfbarer Grundlage eintragen.",
      validation: (rule) => rule.max(32),
    }),
    defineField({
      name: "additionalText",
      title: "Kurzer Zusatztext",
      type: "string",
      description: "Konkrete Produkteigenschaft nennen. Allgemeine Umwelt- oder Nachhaltigkeitsversprechen vermeiden.",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: {title: "name", subtitle: "label", media: "image"},
  },
})
