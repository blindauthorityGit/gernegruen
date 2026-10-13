import {defineField, defineType} from "sanity"

export const weeklyProduceImportProduct = defineType({
  name: "weeklyProduceImportProduct",
  title: "Importiertes Obst- oder Gemüseprodukt",
  type: "object",
  fields: [
    defineField({name: "name", title: "Produktname (Original)", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "normalizedName", title: "Normalisierter Produktname", type: "string", readOnly: true}),
    defineField({name: "unit", title: "Einheit (Originalwert)", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "unitKind", title: "Einheitenart", type: "string", options: {list: [{title: "Kilogramm", value: "kg"}, {title: "Stück", value: "piece"}]}}),
    defineField({name: "price", title: "Preis pro Einheit", type: "number", validation: (rule) => rule.required().min(0)}),
    defineField({name: "brand", title: "Produktmarke", type: "string", description: "Zum Beispiel bioladen*. Wird aus dem Originalpräfix b* übernommen; die Marke ist keine Zertifizierungsstelle."}),
    defineField({name: "originalBrandMarker", title: "Originale Markenkennzeichnung aus Excel", type: "string", readOnly: true, description: "Das Originalpräfix bleibt zusätzlich im Produktnamen erhalten."}),
    defineField({name: "origin", title: "Herkunftsland", type: "string", description: "Lieferantenangabe aus der Excel-Liste; das Herkunftsland allein bedeutet nicht regional."}),
    defineField({name: "originRegion", title: "Herkunftsregion (optional)", type: "string", description: "Nur eintragen, wenn die genauere Region vom Lieferanten angegeben wurde."}),
    defineField({name: "certification", title: "Verbands-/Bio-Angabe (Lieferant)", type: "string", description: "Angabe aus der Excel-Liste. Ohne zusätzliche Prüfung als Lieferantenangabe behandeln, nicht als bestätigtes Zertifikat."}),
    defineField({name: "bioStatus", title: "Bio-Status", type: "string", initialValue: "unknown", options: {list: [{title: "Unbekannt (Standard beim Import)", value: "unknown"}, {title: "Bestätigt", value: "confirmed"}, {title: "Nicht bestätigt", value: "unconfirmed"}]}, description: "Ein Import setzt diesen Status nie auf bestätigt. Bestätigung nur nach eigener Prüfung mit interner Nachweisreferenz.", validation: (rule) => rule.custom((value, context) => value !== "confirmed" || Boolean((context.parent as {bioEvidenceReference?: string} | undefined)?.bioEvidenceReference?.trim()) || "Für den bestätigten Status bitte eine interne Nachweisreferenz hinterlegen.")}),
    defineField({name: "bioEvidenceReference", title: "Interne Nachweisreferenz (optional)", type: "string", description: "Interner Ablageort oder Referenz. Keine vertraulichen Zugangsdaten eintragen."}),
    defineField({name: "bioladenCertified", title: "Alte Excel-Spalte „Bioladen-Zertifikat“ (Legacy)", type: "boolean", description: "Wird zur Kompatibilität übernommen, ist aber kein Marken- oder Zertifizierungsnachweis und wird nicht öffentlich angezeigt."}),
    defineField({name: "order", title: "Reihenfolge in der Excel-Datei", type: "number", validation: (rule) => rule.required().integer().min(1)}),
    defineField({
      name: "categoryOverride",
      title: "Kategorie (manuelle Zuordnung)",
      type: "string",
      description: "Optional. Überschreibt die automatische Zuordnung auf der Website.",
      options: {list: [
        {title: "Obst", value: "fruit"},
        {title: "Gemüse", value: "vegetables"},
        {title: "Salate & Kräuter", value: "saladsHerbs"},
        {title: "Pilze", value: "mushrooms"},
        {title: "Weitere Produkte", value: "other"},
      ]},
    }),
  ],
  preview: {select: {title: "name", subtitle: "unit", price: "price"}, prepare: ({title, subtitle, price}) => ({title, subtitle: `${subtitle ?? ""} · ${typeof price === "number" ? price.toFixed(2).replace(".", ",") : ""} €`})},
})
