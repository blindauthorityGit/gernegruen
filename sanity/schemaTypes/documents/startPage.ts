import {DocumentIcon} from "@sanity/icons/Document"
import {defineArrayMember, defineField, defineType} from "sanity"

export const startPage = defineType({
  name: "startPage",
  title: "Startseite",
  type: "document",
  icon: DocumentIcon,
  fields: [
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
    defineField({
      name: "storeIntroSection",
      title: "Laden-Einleitung",
      type: "storeIntroSection",
      description: "Ladenfoto, Beschreibung, Highlights und Sortimentsbereiche unterhalb der Herstellerlogos.",
    }),
    defineField({
      name: "currentContentSection",
      title: "Das gibt’s gerade Neues",
      type: "contentCardSection",
      description: "Der Kartenbereich direkt unter dem Hero.",
      deprecated: {reason: "Die Startseite nutzt jetzt Aktuelles Sortiment mit zeitlich geplanten Ausgaben."},
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare: () => ({title: "Startseite"}),
  },
})
