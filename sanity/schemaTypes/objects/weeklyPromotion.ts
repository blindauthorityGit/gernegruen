import {DocumentIcon} from "@sanity/icons/Document";
import {defineField, defineType} from "sanity";

export const weeklyPromotion = defineType({
  name: "weeklyPromotion",
  title: "Aktionsblatt",
  type: "object",
  icon: DocumentIcon,
  fields: [
    defineField({name: "isEnabled", title: "Aktionsblatt aktiv", type: "boolean", initialValue: true}),
    defineField({name: "title", title: "Titel", type: "string", validation: (rule) => rule.required().max(100)}),
    defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, validation: (rule) => rule.max(300)}),
    defineField({name: "pdf", title: "PDF-Datei", type: "file", options: {accept: "application/pdf"}, validation: (rule) => rule.required()}),
    defineField({name: "validFrom", title: "Gültig ab (Info)", type: "date", description: "Redaktionelle Datumsangabe; die Anzeige wird manuell über „Aktionsblatt aktiv“ gesteuert.", validation: (rule) => rule.required()}),
    defineField({name: "validUntil", title: "Gültig bis (Info)", type: "date", description: "Redaktionelle Datumsangabe; ein aktives Aktionsblatt wird nicht automatisch ausgeblendet.", validation: (rule) => rule.required().custom((value, context) => {
      const start = context.document?.validFrom;
      return !value || typeof start !== "string" || value >= start || "Das Enddatum muss nach dem Startdatum liegen.";
    })}),
    defineField({name: "dateRange", title: "Angezeigter Zeitraum", type: "string", description: "Zum Beispiel: 1.–31. Oktober 2026", validation: (rule) => rule.required().max(80)}),
  ],
  preview: {select: {title: "title", subtitle: "dateRange", media: "pdf"}},
});
