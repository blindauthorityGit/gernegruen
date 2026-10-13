import {CalendarIcon} from "@sanity/icons/Calendar"
import {defineArrayMember, defineField, defineType} from "sanity"

export const weeklyProduceList = defineType({
  name: "weeklyProduceList",
  title: "Obst- & Gemüseliste",
  type: "document",
  icon: CalendarIcon,
  groups: [{name: "week", title: "Woche", default: true}, {name: "products", title: "Produkte"}],
  fields: [
    defineField({name: "title", title: "Bezeichnung", type: "string", group: "week", validation: (rule) => rule.required()}),
    defineField({name: "week", title: "Kalenderwoche", type: "number", group: "week", validation: (rule) => rule.required().integer().min(1).max(53)}),
    defineField({name: "year", title: "Jahr", type: "number", group: "week", validation: (rule) => rule.required().integer().min(2020).max(2100)}),
    defineField({name: "importedAt", title: "Importdatum", type: "datetime", group: "week", readOnly: true}),
    defineField({name: "importStatus", title: "Importstatus", type: "string", group: "week", options: {list: [{title: "Importiert (Entwurf)", value: "imported"}]}, readOnly: true}),
    defineField({name: "isArchived", title: "Archiviert", type: "boolean", group: "week", initialValue: false}),
    defineField({name: "productCount", title: "Anzahl der Produkte", type: "number", group: "week", readOnly: true}),
    defineField({name: "sourceFileName", title: "Quelldatei", type: "string", group: "week", readOnly: true}),
    defineField({name: "products", title: "Produkte", type: "array", group: "products", of: [defineArrayMember({type: "weeklyProduceImportProduct"})], validation: (rule) => rule.required().min(1)}),
  ],
  orderings: [{title: "Jahr und Kalenderwoche", name: "weekDescending", by: [{field: "year", direction: "desc"}, {field: "week", direction: "desc"}]}],
  preview: {select: {title: "title", week: "week", year: "year", count: "productCount", archived: "isArchived"}, prepare: ({title, week, year, count, archived}) => ({title: title ?? "Obst & Gemüse", subtitle: `${archived ? "Archiviert · " : ""}KW ${week ?? "?"}/${year ?? "?"} · ${count ?? 0} Produkte`})},
})
