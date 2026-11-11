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
      description: "Die Wochenangebote werden aus der zuletzt bearbeiteten freigegebenen Sortimentsausgabe geladen. Sektion anzeigen blendet den gesamten Startseitenbereich aus.",
      fields: [
        defineField({name: "enabled", title: "Sektion anzeigen", type: "boolean", initialValue: true}),
        defineField({name: "editions", title: "Sortimentsausgaben", type: "array", description: "Hier werden Wochenangebote verknüpft. Die zuletzt bearbeitete freigegebene Ausgabe wird angezeigt.", of: [defineArrayMember({type: "reference", to: [{type: "assortmentEdition"}]})], validation: r => r.unique()}),
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
