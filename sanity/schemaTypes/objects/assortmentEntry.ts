import {ImageIcon} from "@sanity/icons/Image"
import {defineField, defineType} from "sanity"

export const assortmentEntry = defineType({
  name: "assortmentEntry",
  title: "Angebotseintrag",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({name: "title", title: "Produktname", type: "string", validation: rule => rule.required().max(100)}),
    defineField({name: "description", title: "Zusatzzeile", type: "string", description: "Optionale Zusatzinfo zum Produkt oder Highlight.", validation: rule => rule.max(160)}),
    defineField({name: "ingredients", title: "Zutaten", type: "text", rows: 4, description: "Bei Brot und Kuchen erscheinen die Zutaten klein auf den Angebotskarten und in der Vorbestellliste.", validation: rule => rule.max(1800)}),
    defineField({name: "price", title: "Preis in Euro", type: "number", description: "Optionaler Produktpreis, z. B. 4,10.", validation: rule => rule.positive().precision(2)}),
  ],
  preview: {select: {title: "title", subtitle: "description"}},
})
