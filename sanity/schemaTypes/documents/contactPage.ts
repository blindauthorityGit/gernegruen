import {DocumentIcon} from "@sanity/icons/Document";
import {defineArrayMember, defineField, defineType} from "sanity";

export const contactPage = defineType({
  name: "contactPage", title: "Kontakt & Anfahrt", type: "document", icon: DocumentIcon,
  fields: [
    defineField({name: "isVisible", title: "Seite veröffentlichen", type: "boolean", initialValue: true}),
    defineField({name: "seoTitle", title: "SEO-Titel", type: "string", description: "Keine pauschalen Bio-, Umwelt- oder Regionalitätsversprechen für den gesamten Betrieb verwenden.", validation: (rule) => rule.max(70)}),
    defineField({name: "seoDescription", title: "SEO-Beschreibung", type: "text", rows: 2, description: "Umwelt- oder Herkunftsaussagen konkret auf Produkte beziehen und intern belegbar halten.", validation: (rule) => rule.max(180)}),
    defineField({name: "seoKeywords", title: "SEO-Suchbegriffe", type: "array", of: [defineArrayMember({type: "string"})], validation: (rule) => rule.max(10)}),
    defineField({name: "hero", title: "Hero", type: "object", fields: [
      defineField({name: "headline", title: "Headline", type: "string", validation: (rule) => rule.required().max(40)}),
      defineField({name: "headlineAccent", title: "Akzentzeile", type: "string", validation: (rule) => rule.required().max(50)}),
      defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, description: "Falls Umwelt- oder Herkunftsaussagen vorkommen: konkret eingrenzen und belegbar halten.", validation: (rule) => rule.required().max(260)}),
      defineField({name: "image", title: "Ladenfoto", type: "image", options: {hotspot: true}, validation: (rule) => rule.required()}),
      defineField({name: "imageAlt", title: "Bild-Alt-Text", type: "string", validation: (rule) => rule.required().max(160)}),
    ]}),
    defineField({name: "cards", title: "Kontaktkarten", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "openingHoursHeading", title: "Überschrift Öffnungszeiten", type: "string", initialValue: "Öffnungszeiten"}),
      defineField({name: "contactHeading", title: "Überschrift Adresse & Kontakt", type: "string", initialValue: "Adresse & Kontakt"}),
    ]}),
    defineField({name: "directions", title: "Anfahrt", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.required().max(100)}),
      defineField({name: "description", title: "Beschreibung", type: "text", rows: 2, validation: (rule) => rule.max(240)}),
      defineField({name: "mapZoom", title: "Karten-Zoomstufe", type: "number", initialValue: 17, validation: (rule) => rule.min(12).max(19)}),
      defineField({name: "routeLabel", title: "Route-Button", type: "string", initialValue: "Route planen", validation: (rule) => rule.max(40)}),
    ]}),
  ],
  preview: {prepare: () => ({title: "Kontakt & Anfahrt", subtitle: "Hero, Kontaktkarten und Wegbeschreibung"})},
});
