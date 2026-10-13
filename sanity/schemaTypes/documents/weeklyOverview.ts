import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineArrayMember, defineField, defineType } from "sanity";

export const weeklyOverview = defineType({
  name: "weeklyOverview",
  title: "Wochenübersicht",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "schedule", title: "Zeitraum", default: true },
    { name: "produce", title: "Obst & Gemüse" },
    { name: "bakery", title: "Backwaren" },
    { name: "promotions", title: "Aktionen" },
  ],
  fields: [
    defineField({ name: "internalTitle", title: "Interner Name", type: "string", group: "schedule", validation: (rule) => rule.required() }),
    defineField({ name: "isEnabled", title: "Ausgabe freigeben", type: "boolean", group: "schedule", initialValue: true }),
    defineField({ name: "week", title: "Kalenderwoche", type: "number", group: "schedule", validation: (rule) => rule.required().integer().min(1).max(53) }),
    defineField({ name: "year", title: "Jahr", type: "number", group: "schedule", validation: (rule) => rule.required().integer().min(2020).max(2100) }),
    defineField({ name: "validFrom", title: "Anzeigen ab", type: "datetime", group: "schedule", validation: (rule) => rule.required() }),
    defineField({ name: "validUntil", title: "Anzeigen bis", type: "datetime", group: "schedule", validation: (rule) => rule.required().custom((value, context) => {
      const start = context.document?.validFrom;
      return !value || typeof start !== "string" || Date.parse(value) > Date.parse(start) || "Das Ende muss nach dem Beginn liegen.";
    }) }),
    defineField({ name: "dateRange", title: "Angezeigter Datumsbereich", type: "string", group: "schedule", validation: (rule) => rule.required().max(80) }),
    defineField({ name: "produceGroups", title: "Obst- und Gemüselisten", type: "array", group: "produce", of: [defineArrayMember({ type: "weeklyProduceGroup" })], validation: (rule) => rule.required().min(1) }),
    defineField({ name: "produceSourceFileName", title: "Letzte Importdatei", type: "string", group: "produce", readOnly: true, description: "Wird später durch den serverseitigen Excel-Import gesetzt." }),
    defineField({ name: "bakeryHighlights", title: "Brot & Kuchen der Woche", type: "array", group: "bakery", of: [defineArrayMember({ type: "weeklyBakeryHighlight" })], validation: (rule) => rule.required().min(2).max(2) }),
    defineField({ name: "bakeryCatalog", title: "Backwarensortiment", type: "reference", group: "bakery", to: [{ type: "bakeryCatalog" }], validation: (rule) => rule.required() }),
    defineField({ name: "promotionSheet", title: "Aktionsblatt", type: "reference", group: "promotions", to: [{ type: "promotionSheet" }] }),
  ],
  orderings: [{ title: "Neueste Woche", name: "weekDescending", by: [{ field: "year", direction: "desc" }, { field: "week", direction: "desc" }] }],
  preview: { select: { title: "internalTitle", week: "week", year: "year", enabled: "isEnabled" }, prepare: ({ title, week, year, enabled }) => ({ title, subtitle: `${enabled === false ? "Deaktiviert · " : ""}KW ${week ?? "?"} · ${year ?? "?"}` }) },
});
