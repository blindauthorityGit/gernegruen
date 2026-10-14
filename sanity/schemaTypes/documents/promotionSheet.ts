import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType } from "sanity";

export const promotionSheet = defineType({
  name: "promotionSheet",
  title: "Aktionsblatt",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({name: "isEnabled", title: "Aktionsblatt aktiv", type: "boolean", initialValue: true, description: "Aktive Aktionsblätter werden während ihres Gültigkeitszeitraums auf der Seite „Diese Woche“ angezeigt."}),
    defineField({ name: "title", title: "Titel", type: "string", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 3, validation: (rule) => rule.max(300) }),
    defineField({ name: "pdf", title: "PDF-Datei", type: "file", options: { accept: "application/pdf" }, validation: (rule) => rule.required() }),
    defineField({ name: "validFrom", title: "Gültig ab", type: "date", validation: (rule) => rule.required() }),
    defineField({ name: "validUntil", title: "Gültig bis", type: "date", validation: (rule) => rule.required().custom((value, context) => {
      const start = context.document?.validFrom;
      return !value || typeof start !== "string" || value >= start || "Das Enddatum muss nach dem Startdatum liegen.";
    }) }),
    defineField({ name: "dateRange", title: "Angezeigter Zeitraum", type: "string", description: "Zum Beispiel: 1.–31. August 2026", validation: (rule) => rule.required().max(80) }),
  ],
  orderings: [{ title: "Neuester Zeitraum", name: "validFromDescending", by: [{ field: "validFrom", direction: "desc" }] }],
});
