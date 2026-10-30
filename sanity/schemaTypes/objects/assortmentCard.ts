import {ImageIcon} from "@sanity/icons/Image"
import {defineArrayMember, defineField, defineType} from "sanity"

export const assortmentEntry = defineType({
  name: "assortmentEntry", title: "Listenpunkt", type: "object", icon: ImageIcon,
  fields: [
    defineField({name: "title", title: "Produktname (Brot oder Kuchen)", type: "string", validation: r => r.required().max(100)}),
    defineField({name: "description", title: "Zusatzzeile", type: "string", description: "Optionale Zusatzinfo zum Produkt oder Highlight.", validation: r => r.max(160)}),
    defineField({name: "ingredients", title: "Zutaten", type: "text", rows: 4, description: "Bei Brot/Kuchen der Woche die Zutaten hier pflegen. Sie erscheinen klein auf den Angebotskarten und in der Vorbestellliste.", validation: r => r.max(1800)}),
    defineField({name: "price", title: "Preis in Euro", type: "number", description: "Optionaler Produktpreis, z. B. 4,10.", validation: r => r.positive().precision(2)}),
  ],
  preview: {select: {title: "title", subtitle: "description"}},
})

export const assortmentCard = defineType({
  name: "assortmentCard", title: "Sortimentskarte", type: "object", icon: ImageIcon,
  fields: [
    defineField({name: "title", title: "Überschrift", type: "string", description: "Bei Umwelt- oder Herkunftsangaben den konkreten Bezug nennen und intern belegen.", validation: r => r.required().max(80)}),
    defineField({name: "image", title: "Bild", type: "image", options: {hotspot: true}, validation: r => r.required()}),
    defineField({name: "imageAlt", title: "Bildbeschreibung", type: "string", validation: r => r.required().max(160)}),
    defineField({name: "intro", title: "Einleitung", type: "text", rows: 2, description: "Umwelt- und Herkunftsaussagen nur für konkret genannte Produkte und mit prüfbarer Grundlage verwenden.", validation: r => r.max(240)}),
    defineField({name: "marker", title: "Listen-Symbol", type: "string", initialValue: "leaf", options: {list: [{title: "Grünes Blatt", value: "leaf"}, {title: "Brot", value: "bread"}, {title: "Hellgrünes Blatt", value: "promotion"}]}, validation: r => r.required()}),
    defineField({name: "entries", title: "Produkte / Highlights", type: "array", description: "Für Brot und Kuchen der Woche die festen Einträge Brot/Kuchen bearbeiten: Produktname, Zutaten und optional Preis. Diese Angaben erscheinen auch in der Vorbestellliste.", of: [defineArrayMember({type: "assortmentEntry"})], validation: r => r.max(12)}),
    defineField({name: "note", title: "Hinweis unter der Liste", type: "text", rows: 2, description: "Keine pauschalen Umwelt- oder Regionalitätsaussagen über das Sortiment ergänzen.", validation: r => r.max(240)}),
    defineField({name: "cta", title: "Button", type: "contentLink"}),
  ],
  preview: {select: {title: "title", media: "image"}},
})
