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
    defineField({name: "isEnabled", title: "Auf der Website anzeigen", type: "boolean", group: "week", initialValue: true, description: "Die zuletzt bearbeitete veröffentlichte Liste wird angezeigt. Zum manuellen Wechsel ältere Listen zuerst entarchivieren, dann aktivieren und neuere Listen deaktivieren; zum Abschalten alle Listen deaktivieren."}),
    defineField({name: "importedAt", title: "Zeitpunkt (intern)", type: "datetime", group: "week", readOnly: true, hidden: true}),
    defineField({name: "importStatus", title: "Status (intern)", type: "string", group: "week", options: {list: [{title: "Als Entwurf vorbereitet", value: "imported"}]}, readOnly: true, hidden: true}),
    defineField({name: "isArchived", title: "Archiviert", type: "boolean", group: "week", initialValue: false}),
    defineField({name: "productCount", title: "Anzahl der Produkte", type: "number", group: "week", readOnly: true, hidden: true}),
    defineField({name: "sourceFileName", title: "Quelle (technisch)", type: "string", group: "week", readOnly: true, hidden: true}),
    defineField({name: "products", title: "Produkte", type: "array", group: "products", of: [defineArrayMember({type: "weeklyProduceImportProduct"})], validation: (rule) => rule.required().min(1)}),
  ],
  orderings: [{title: "Zuletzt bearbeitet", name: "updatedDescending", by: [{field: "_updatedAt", direction: "desc"}]}],
  preview: {select: {title: "title", week: "week", year: "year", products: "products", archived: "isArchived", enabled: "isEnabled"}, prepare: ({title, week, year, products, archived, enabled}) => ({title: title ?? "Obst & Gemüse", subtitle: `${archived ? "Archiviert · " : enabled === false ? "Deaktiviert · " : ""}KW ${week ?? "?"}/${year ?? "?"} · ${Array.isArray(products) ? products.length : 0} Produkte`})},
})
