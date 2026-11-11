import {defineField, defineType} from "sanity"

export const weeklyProduceImportProduct = defineType({
  name: "weeklyProduceImportProduct",
  title: "Wochenprodukt",
  type: "object",
  fields: [
    defineField({name: "name", title: "Produktname", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "normalizedName", title: "Normalisierter Produktname", type: "string", readOnly: true, hidden: true}),
    defineField({name: "unit", title: "Einheit", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "unitKind", title: "Einheitenart", type: "string", options: {list: [{title: "Kilogramm", value: "kg"}, {title: "Stück", value: "piece"}]}}),
    defineField({name: "price", title: "Preis pro Einheit", type: "number", validation: (rule) => rule.required().min(0)}),
    defineField({name: "brand", title: "Produktmarke", type: "string", description: "Zum Beispiel bioladen*. Marke und Verbands-/Bio-Angabe sind getrennte Felder."}),
    defineField({name: "originalBrandMarker", title: "Markenpräfix (technisch)", type: "string", readOnly: true, hidden: true}),
    defineField({name: "origin", title: "Herkunftsland", type: "string", description: "Angabe des Lieferanten; das Herkunftsland allein bedeutet nicht regional."}),
    defineField({name: "originRegion", title: "Herkunftsregion (optional)", type: "string", description: "Nur eintragen, wenn die genauere Region vom Lieferanten angegeben wurde."}),
    defineField({name: "certification", title: "Verbands-/Bio-Angabe", type: "string", description: "Herkunftsland und Produktmarke bleiben getrennte Felder."}),
    defineField({name: "order", title: "Sortierung", type: "number", description: "Kleinere Zahlen erscheinen weiter oben.", validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: "category", title: "Kategorie", type: "reference", to: [{type: "produceCategory"}], description: "Die Kategorie bestimmt die Überschrift und Gruppierung auf der Website."}),
    defineField({
      name: "categoryOverride",
      title: "Alte Kategorie-Zuordnung",
      type: "string",
      hidden: true,
      deprecated: {reason: "Bitte das Produkt mit einer Obst- & Gemüsekategorie verknüpfen."},
    }),
  ],
  preview: {select: {title: "name", subtitle: "unit", price: "price"}, prepare: ({title, subtitle, price}) => ({title, subtitle: `${subtitle ?? ""} · ${typeof price === "number" ? price.toFixed(2).replace(".", ",") : ""} €`})},
})
