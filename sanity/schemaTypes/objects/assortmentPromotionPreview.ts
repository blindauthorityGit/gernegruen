import {defineArrayMember, defineField, defineType} from "sanity"

export const assortmentPromotionPreview = defineType({
  name: "assortmentPromotionPreview",
  title: "Aktionsvorschau",
  type: "object",
  fields: [
    defineField({name: "title", title: "Überschrift", type: "string", validation: rule => rule.required().max(80)}),
    defineField({name: "intro", title: "Einleitung", type: "text", rows: 2, validation: rule => rule.max(240)}),
    defineField({name: "entries", title: "Highlights", type: "array", of: [defineArrayMember({type: "assortmentEntry"})], validation: rule => rule.max(2)}),
    defineField({name: "cta", title: "Aktionslink", type: "contentLink", description: "Führt zur Aktionssektion auf der Seite ‚Diese Woche‘.", initialValue: {label: "Alle Aktionen ansehen", href: "/diese-woche#aktionen"}}),
  ],
})
