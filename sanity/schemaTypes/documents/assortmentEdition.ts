import {CalendarIcon} from "@sanity/icons/Calendar"
import {defineArrayMember, defineField, defineType} from "sanity"

export const assortmentEdition = defineType({
  name: "assortmentEdition", title: "Sortimentsausgabe", type: "document", icon: CalendarIcon,
  groups: [{name: "schedule", title: "Zeitraum", default: true}, {name: "content", title: "Texte & Störer"}, {name: "cards", title: "Karten"}],
  fields: [
    defineField({name: "internalTitle", title: "Interner Name", type: "string", group: "schedule", description: "Zum Wiederfinden, z. B. Sortiment KW 38–39 / September 2026.", validation: r => r.required()}),
    defineField({name: "isEnabled", title: "Ausgabe freigeben", type: "boolean", initialValue: true, group: "schedule", description: "Die neueste veröffentlichte, freigegebene Ausgabe versorgt den Startseiten-Teaser und die Brot-/Kuchen-Highlights."}),
    defineField({name: "startAt", title: "Geplanter Zeitraum beginnt", type: "datetime", group: "schedule", description: "Planungsinformation; die Website blendet die manuell gepflegten Teaser nicht automatisch nach diesem Zeitpunkt aus.", validation: r => r.required()}),
    defineField({name: "endAt", title: "Geplanter Zeitraum endet", type: "datetime", group: "schedule", description: "Planungsinformation; zum Wechsel die gewünschte Ausgabe bearbeiten/veröffentlichen oder deaktivieren.", validation: r => r.required().custom((v, ctx) => {
      const start = ctx.document?.startAt
      return !v || typeof start !== "string" || Date.parse(v) > Date.parse(start) || "Das Ende muss nach dem Beginn liegen."
    })}),
    defineField({name: "topline", title: "Topline", type: "string", group: "content", validation: r => r.max(140)}),
    defineField({name: "heading", title: "Headline", type: "string", group: "content", initialValue: "Gerade frisch, gerade besonders", validation: r => r.required().max(100)}),
    defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, group: "content", description: "Umwelt- oder Herkunftsaussagen konkret auf die jeweils genannten Produkte begrenzen und belegen.", validation: r => r.max(300)}),
    defineField({name: "callout", title: "Störer-Text", type: "string", group: "content", description: "Optional, z. B. KW 38 – KW 39. Ohne Text wird der Störer ausgeblendet.", validation: r => r.max(45)}),
    defineField({name: "cta", title: "Link unter der Beschreibung", type: "contentLink", group: "content"}),
    defineField({name: "cards", title: "Sortimentskarten", type: "array", group: "cards", description: "Karten hinzufügen, bearbeiten und per Drag & Drop sortieren. Drei Karten entsprechen der Figma-Vorlage; zusätzliche Karten bilden weitere Reihen.", of: [defineArrayMember({type: "assortmentCard"})], validation: r => r.required().min(1).max(12)}),
  ],
  orderings: [{title: "Neuester Zeitraum", name: "startDescending", by: [{field: "startAt", direction: "desc"}]}],
  preview: {select: {title: "internalTitle", start: "startAt", end: "endAt", enabled: "isEnabled"}, prepare: ({title, start, end, enabled}) => ({title, subtitle: `${enabled === false ? "Deaktiviert · " : ""}${start?.slice(0,10) ?? "?"} – ${end?.slice(0,10) ?? "?"}`})},
})
