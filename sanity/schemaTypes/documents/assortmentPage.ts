import {defineArrayMember, defineField, defineType} from "sanity";

export const assortmentPage = defineType({
  name: "assortmentPage", title: "Sortimentsseite", type: "document",
  fields: [
    defineField({name: "isVisible", title: "Seite veröffentlichen", type: "boolean", initialValue: true}),
    defineField({name: "heroTitle", title: "Hero-Überschrift", type: "string", validation: (rule) => rule.required().max(80)}),
    defineField({name: "heroDescription", title: "Hero-Beschreibung", type: "text", rows: 3, validation: (rule) => rule.required().max(240)}),
    defineField({name: "badgeVisible", title: "Produkt-Störer anzeigen", type: "boolean", initialValue: true}),
    defineField({name: "badgeTitle", title: "Störer-Hervorhebung", type: "string", validation: (rule) => rule.max(80)}),
    defineField({name: "badgeText", title: "Störer-Zusatztext", type: "string", validation: (rule) => rule.max(120)}),
    defineField({name: "brandsHeading", title: "Überschrift Markenleiste", type: "string", validation: (rule) => rule.max(100)}),
    defineField({name: "productWish", title: "Produktwunsch-Sektion", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "eyebrow", title: "Kleine Überschrift", type: "string", validation: (rule) => rule.max(80)}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(120)}),
      defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, validation: (rule) => rule.max(500)}),
      defineField({name: "disclaimer", title: "Hinweis", type: "text", rows: 2, validation: (rule) => rule.max(240)}),
      defineField({name: "buttonLabel", title: "Button-Beschriftung", type: "string", validation: (rule) => rule.max(60)}),
    ]}),
    defineField({name: "gallery", title: "Einblicke in den Markt", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "eyebrow", title: "Kleine Überschrift", type: "string", validation: (rule) => rule.max(80)}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(120)}),
      defineField({name: "description", title: "Einleitung", type: "text", rows: 2, validation: (rule) => rule.max(240)}),
      defineField({name: "images", title: "Galeriebilder", type: "array", validation: (rule) => rule.max(12), of: [defineArrayMember({type: "object", fields: [
        defineField({name: "image", title: "Bild", type: "image", options: {hotspot: true}, validation: (rule) => rule.required()}),
        defineField({name: "altText", title: "Alternativtext", type: "string", validation: (rule) => rule.required().max(160)}),
        defineField({name: "caption", title: "Bildunterschrift", type: "string", validation: (rule) => rule.max(100)}),
      ]})]}),
    ]}),
    defineField({name: "groups", title: "Kategoriegruppen", type: "array", of: [defineArrayMember({type: "object", fields: [
      defineField({name: "key", title: "Stabile Kennung", type: "string", validation: (rule) => rule.required()}),
      defineField({name: "title", title: "Abschnittsüberschrift", type: "string", validation: (rule) => rule.required().max(80)}),
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "categories", title: "Kategorien in diesem Abschnitt", type: "array", of: [defineArrayMember({type: "reference", to: [{type: "assortmentCategory"}]})]}),
    ]})]}),
  ],
  preview: {prepare: () => ({title: "Unser Sortiment", subtitle: "Hero, Kategorien und Galerie"})},
});
