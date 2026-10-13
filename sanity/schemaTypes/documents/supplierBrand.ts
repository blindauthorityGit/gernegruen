import {defineField, defineType} from "sanity";

export const supplierBrand = defineType({
  name: "supplierBrand", title: "Marke / Hersteller", type: "document",
  fields: [
    defineField({name: "name", title: "Name", type: "string", validation: (rule) => rule.required().max(80)}),
    defineField({name: "logo", title: "Logo", type: "image", options: {hotspot: true}, validation: (rule) => rule.required()}),
    defineField({name: "description", title: "Beschreibung (optional)", type: "text", rows: 2, validation: (rule) => rule.max(240)}),
    defineField({name: "url", title: "Externer Link (optional)", type: "url", validation: (rule) => rule.uri({scheme: ["http", "https"]})}),
    defineField({name: "sortOrder", title: "Sortierreihenfolge", type: "number", initialValue: 0, validation: (rule) => rule.integer()}),
    defineField({name: "isVisible", title: "Auf der Website anzeigen", type: "boolean", initialValue: true}),
  ],
  orderings: [{title: "Sortierung", name: "sortOrder", by: [{field: "sortOrder", direction: "asc"}, {field: "name", direction: "asc"}]}],
  preview: {select: {title: "name", media: "logo", subtitle: "sortOrder"}},
});
