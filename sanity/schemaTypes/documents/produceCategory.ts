import {TagIcon} from "@sanity/icons/Tag"
import {defineField, defineType} from "sanity"

export const produceCategory = defineType({
  name: "produceCategory",
  title: "Obst- & Gemüsekategorie",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({name: "title", title: "Kategoriename", type: "string", validation: (rule) => rule.required().max(80)}),
    defineField({name: "sortOrder", title: "Reihenfolge auf der Website", type: "number", description: "Kleinere Zahlen erscheinen weiter oben.", validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: "showInHomepageTeaser", title: "Im Startseiten-Teaser berücksichtigen", type: "boolean", initialValue: true}),
  ],
  orderings: [{title: "Reihenfolge auf der Website", name: "sortOrder", by: [{field: "sortOrder", direction: "asc"}, {field: "title", direction: "asc"}]}],
  preview: {select: {title: "title", sortOrder: "sortOrder"}, prepare: ({title, sortOrder}) => ({title, subtitle: `Position ${sortOrder ?? "?"}`})},
})
