import {CalendarIcon} from "@sanity/icons/Calendar"
import {defineField, defineType} from "sanity"

export const assortmentEdition = defineType({
  name: "assortmentEdition", title: "Sortimentsausgabe", type: "document", icon: CalendarIcon,
  groups: [{name: "schedule", title: "Freigabe & Zeitraum", default: true}, {name: "content", title: "Texte & Störer"}, {name: "offers", title: "Wochenangebote"}],
  fields: [
    defineField({name: "internalTitle", title: "Interner Name", type: "string", group: "schedule", description: "Zum Wiederfinden, z. B. Wochenangebote KW 46/2026.", validation: r => r.required()}),
    defineField({name: "isEnabled", title: "Ausgabe freigeben", type: "boolean", initialValue: true, group: "schedule", description: "Die zuletzt bearbeitete veröffentlichte und freigegebene Ausgabe wird angezeigt. Zum manuellen Wechsel eine Ausgabe aktivieren und die anderen deaktivieren; zum Abschalten alle Ausgaben deaktivieren."}),
    defineField({name: "startAt", title: "Datumsangabe: beginnt", type: "datetime", group: "schedule", description: "Redaktionelle Datumsangabe; steuert nicht die Auswahl der angezeigten Ausgabe.", validation: r => r.required()}),
    defineField({name: "endAt", title: "Datumsangabe: endet", type: "datetime", group: "schedule", description: "Redaktionelle Datumsangabe; steuert nicht die Auswahl der angezeigten Ausgabe.", validation: r => r.required().custom((v, ctx) => {
      const start = ctx.document?.startAt
      return !v || typeof start !== "string" || Date.parse(v) > Date.parse(start) || "Das Ende muss nach dem Beginn liegen."
    })}),
    defineField({name: "topline", title: "Topline", type: "string", group: "content", description: "Nur ein kurzer Text, ohne Kalenderwoche oder Datumsbereich. KW und Zeitraum werden automatisch aus der aktiven Obst- & Gemüseliste übernommen.", validation: r => r.max(80)}),
    defineField({name: "heading", title: "Headline", type: "string", group: "content", initialValue: "Gerade frisch, gerade besonders", validation: r => r.required().max(100)}),
    defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, group: "content", description: "Umwelt- oder Herkunftsaussagen konkret auf die jeweils genannten Produkte begrenzen und belegen.", validation: r => r.max(300)}),
    defineField({name: "cta", title: "Link unter der Beschreibung", type: "contentLink", group: "content"}),
    defineField({name: "bakeryHighlights", title: "Brot & Kuchen der Woche", type: "weeklyBakeryHighlights", group: "offers", description: "Diese zwei festen Angebote erscheinen in der Startseiten-Vorschau, auf ‚Diese Woche‘ und – falls ein Preis vorliegt – in der Vorbestellung.", validation: r => r.required()}),
    defineField({name: "promotionPreview", title: "Aktionsvorschau", type: "assortmentPromotionPreview", group: "offers", description: "Optionale Vorschau aktueller Aktionen auf der Startseite."}),
  ],
  orderings: [{title: "Zuletzt bearbeitet", name: "updatedDescending", by: [{field: "_updatedAt", direction: "desc"}]}],
  preview: {select: {title: "internalTitle", start: "startAt", end: "endAt", enabled: "isEnabled"}, prepare: ({title, start, end, enabled}) => ({title, subtitle: `${enabled === false ? "Deaktiviert · " : ""}${start?.slice(0,10) ?? "?"} – ${end?.slice(0,10) ?? "?"}`})},
})
