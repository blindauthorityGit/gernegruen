import {TagIcon} from "@sanity/icons/Tag";
import {defineField, defineType} from "sanity";

export const assortmentCategory = defineType({
  name: "assortmentCategory", title: "Sortimentskategorie", type: "document", icon: TagIcon,
  fields: [
    defineField({name: "title", title: "Name", type: "string", validation: (rule) => rule.required().max(80)}),
    defineField({name: "slug", title: "Stabile Kennung", type: "slug", options: {source: "title", maxLength: 48}, validation: (rule) => rule.required()}),
    defineField({name: "description", title: "Kurzbeschreibung", type: "text", rows: 2, description: "Keine pauschalen Umwelt- oder Regionalitätsaussagen über die Kategorie. Herkunft nur bei konkretem Produktbezug und belegter Angabe nennen.", validation: (rule) => rule.max(220)}),
    defineField({name: "examples", title: "Beispielprodukte", type: "array", of: [{type: "string"}], validation: (rule) => rule.max(8)}),
    defineField({name: "badgeText", title: "Karten-Störer (optional)", type: "string", description: "Kurzer Hinweis auf dem Foto, zum Beispiel „Täglich frisch“. ", validation: (rule) => rule.max(32)}),
    defineField({name: "icon", title: "Kategorie-Icon für die Navigation", type: "image", options: {hotspot: true}}),
    defineField({name: "image", title: "Kategoriebild (optional)", type: "image", options: {hotspot: true}}),
    defineField({name: "imageAlt", title: "Alternativtext", type: "string", validation: (rule) => rule.max(160)}),
    defineField({name: "group", title: "Abschnitt", type: "string", options: {list: [{title: "Frisch bei uns", value: "fresh"}, {title: "Alles für Küche & Vorrat", value: "pantry"}, {title: "Für dich und Zuhause", value: "home"}]}, validation: (rule) => rule.required()}),
    defineField({name: "sortOrder", title: "Sortierreihenfolge", type: "number", initialValue: 0}),
    defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
    defineField({name: "ctaLabel", title: "CTA-Text (optional)", type: "string", validation: (rule) => rule.max(60)}),
    defineField({name: "ctaHref", title: "CTA-Linkziel (optional)", type: "string", validation: (rule) => rule.max(200)}),
  ],
  orderings: [{title: "Sortierung", name: "sortOrder", by: [{field: "sortOrder", direction: "asc"}]}],
  preview: {select: {title: "title", subtitle: "group", media: "image"}},
});
