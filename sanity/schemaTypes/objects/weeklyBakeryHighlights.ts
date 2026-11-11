import {defineField, defineType} from "sanity"

export const weeklyBakeryHighlights = defineType({
  name: "weeklyBakeryHighlights",
  title: "Brot & Kuchen der Woche",
  type: "object",
  fields: [
    defineField({name: "bread", title: "Brot der Woche", type: "assortmentEntry", validation: rule => rule.required()}),
    defineField({name: "cake", title: "Kuchen der Woche", type: "assortmentEntry", validation: rule => rule.required()}),
  ],
})
