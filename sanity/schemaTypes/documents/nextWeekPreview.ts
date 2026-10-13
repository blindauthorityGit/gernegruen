import {CalendarIcon} from "@sanity/icons/Calendar"
import {defineArrayMember, defineField, defineType} from "sanity"

const defaultDescription =
  "Ab Donnerstag zeigen wir dir, was ab Montag frisch bei uns eintrifft. Hier schon ein kleiner Vorgeschmack – Änderungen vorbehalten."

export const nextWeekPreview = defineType({
  name: "nextWeekPreview",
  title: "Vorschau nächste Woche",
  type: "document",
  icon: CalendarIcon,
  groups: [
    {name: "schedule", title: "Zeitraum", default: true},
    {name: "content", title: "Inhalt"},
  ],
  fields: [
    defineField({
      name: "offerWeek",
      title: "Angebotswoche (Montag)",
      type: "date",
      group: "schedule",
      description: "Der Montag der Woche, für die diese Vorschau gilt.",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          const date = new Date(`${value}T00:00:00Z`)
          return (!Number.isNaN(date.valueOf()) && date.getUTCDay() === 1) || "Bitte ein Montagsdatum wählen."
        }),
    }),
    defineField({
      name: "publicationDate",
      title: "Veröffentlichungsdatum",
      type: "datetime",
      group: "schedule",
      description: "Optional. Liegt der Zeitpunkt nach Donnerstag 00:00 Uhr, startet die Vorschau erst dann.",
    }),
    defineField({
      name: "isEnabled",
      title: "Aktiv",
      type: "boolean",
      group: "schedule",
      initialValue: true,
      description: "Nur veröffentlichte und aktive Vorschauen können auf der Website erscheinen.",
    }),
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      group: "content",
      initialValue: "Nächste Woche bei uns",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Beschreibung",
      type: "text",
      rows: 3,
      group: "content",
      initialValue: defaultDescription,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "products",
      title: "Produkte",
      type: "array",
      group: "content",
      description: "Produkte hinzufügen und per Drag & Drop in die gewünschte Reihenfolge bringen.",
      of: [defineArrayMember({type: "nextWeekProduct"})],
      validation: (rule) => rule.required().min(1).max(12),
    }),
  ],
  orderings: [
    {title: "Neueste Angebotswoche", name: "offerWeekDescending", by: [{field: "offerWeek", direction: "desc"}]},
  ],
  preview: {
    select: {title: "title", offerWeek: "offerWeek", enabled: "isEnabled", products: "products"},
    prepare: ({title, offerWeek, enabled, products}) => ({
      title: title || "Nächste Woche bei uns",
      subtitle: `${enabled === false ? "Deaktiviert · " : ""}${offerWeek ?? "Kein Montag"} · ${products?.length ?? 0} Produkte`,
    }),
  },
})
