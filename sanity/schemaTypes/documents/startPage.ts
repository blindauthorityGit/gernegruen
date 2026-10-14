import {DocumentIcon} from "@sanity/icons/Document"
import {defineArrayMember, defineField, defineType} from "sanity"

export const startPage = defineType({
  name: "startPage",
  title: "Startseite",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({name: "seoTitle", title: "SEO-Titel", type: "string", validation: (rule) => rule.max(70)}),
    defineField({name: "seoDescription", title: "SEO-Beschreibung", type: "text", rows: 2, validation: (rule) => rule.max(180)}),
    defineField({name: "seoKeywords", title: "SEO-Suchbegriffe", type: "array", of: [defineArrayMember({type: "string"})], validation: (rule) => rule.max(10)}),
    defineField({
      name: "assortmentSection", title: "Aktuelles Sortiment", type: "object",
      description: "Die aktuelle Ausgabe wird automatisch anhand ihres Zeitraums ausgewählt. Ausgaben können im Voraus vorbereitet und veröffentlicht werden.",
      fields: [
        defineField({name: "enabled", title: "Sektion anzeigen", type: "boolean", initialValue: true}),
        defineField({name: "editions", title: "Sortimentsausgaben", type: "array", description: "Ausgaben hier erstellen oder auswählen. Vergangene Ausgaben bleiben als Archiv erhalten und erscheinen nicht mehr auf der Website. Ohne aktuell gültige Ausgabe wird die Sektion ausgeblendet.", of: [defineArrayMember({type: "reference", to: [{type: "assortmentEdition"}]})], validation: r => r.unique()}),
      ],
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "startHero",
      description: "Der einleitende Bereich direkt unter der Hauptnavigation.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({title: "Startseite"}),
  },
})
