import {DocumentIcon} from "@sanity/icons/Document";
import {defineArrayMember, defineField, defineType} from "sanity";

const linkValidation = (rule: import("sanity").StringRule) => rule.required().custom((value) => {
  if (typeof value !== "string") return true;
  return /^(\/|https?:\/\/)/.test(value) || "Bitte einen internen Pfad oder eine vollständige URL eingeben.";
});

export const aboutPage = defineType({
  name: "aboutPage", title: "Über uns", type: "document", icon: DocumentIcon,
  fields: [
    defineField({name: "isVisible", title: "Seite veröffentlichen", type: "boolean", initialValue: true}),
    defineField({name: "seoTitle", title: "SEO-Titel", type: "string", description: "Keine pauschalen Bio-, Umwelt- oder Regionalitätsversprechen für den gesamten Betrieb verwenden.", validation: (rule) => rule.max(70)}),
    defineField({name: "seoDescription", title: "SEO-Beschreibung", type: "text", rows: 2, description: "Umwelt- oder Herkunftsaussagen konkret auf Produkte beziehen und intern belegbar halten.", validation: (rule) => rule.max(180)}),
    defineField({name: "hero", title: "Hero", type: "object", fields: [
      defineField({name: "headline", title: "Headline – erste Zeile", type: "string", validation: (rule) => rule.required().max(40)}),
      defineField({name: "headlineAccent", title: "Headline – Akzentzeile", type: "string", validation: (rule) => rule.required().max(40)}),
      defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, description: "Umwelt- und Herkunftsaussagen nur konkret, eingegrenzt und belegbar formulieren.", validation: (rule) => rule.required().max(260)}),
      defineField({name: "image", title: "Ladenfoto", type: "image", options: {hotspot: true}, validation: (rule) => rule.required()}),
      defineField({name: "imageAlt", title: "Bild-Alt-Text", type: "string", validation: (rule) => rule.required().max(160)}),
    ]}),
    defineField({name: "timeline", title: "Unsere Geschichte", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(100)}),
      defineField({name: "milestones", title: "Meilensteine", type: "array", of: [defineArrayMember({type: "object", fields: [
        defineField({name: "year", title: "Jahr", type: "string", validation: (rule) => rule.required().max(12)}),
        defineField({name: "title", title: "Titel", type: "string", validation: (rule) => rule.required().max(100)}),
        defineField({name: "description", title: "Beschreibung", type: "text", rows: 3, description: "Historische Aussagen klar zeitlich einordnen; konkrete Umwelt-/Herkunftsangaben intern belegen.", validation: (rule) => rule.required().max(500)}),
        defineField({name: "image", title: "Bild", type: "image", options: {hotspot: true}}),
        defineField({name: "imageAlt", title: "Bild-Alt-Text", type: "string", validation: (rule) => rule.max(160)}),
        defineField({name: "sortOrder", title: "Sortierreihenfolge", type: "number", initialValue: 0}),
      ]})]}),
    ]}),
    defineField({name: "gallery", title: "Ladeneinblicke", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "eyebrow", title: "Kleine Überschrift", type: "string", validation: (rule) => rule.max(80)}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(120)}),
      defineField({name: "description", title: "Einleitung", type: "text", rows: 2, description: "Keine pauschalen Umwelt- oder Regionalitätsversprechen ergänzen.", validation: (rule) => rule.max(300)}),
      defineField({name: "images", title: "Bilder", type: "array", of: [defineArrayMember({type: "object", fields: [
        defineField({name: "image", title: "Bild", type: "image", options: {hotspot: true}, validation: (rule) => rule.required()}),
        defineField({name: "title", title: "Bildtitel (optional)", type: "string", validation: (rule) => rule.max(100)}),
        defineField({name: "caption", title: "Beschreibung (optional)", type: "string", description: "Konkreten Bildinhalt beschreiben; Bio-, Herkunfts- oder Saisonangaben nur mit passender Grundlage.", validation: (rule) => rule.max(200)}),
        defineField({name: "altText", title: "Alternativtext", type: "string", validation: (rule) => rule.required().max(160)}),
        defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
        defineField({name: "sortOrder", title: "Sortierreihenfolge", type: "number", initialValue: 0}),
      ]})]}),
    ]}),
    defineField({name: "benefits", title: "Unsere Vorteile", type: "object", fields: [
      defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(100)}),
      defineField({name: "items", title: "Vorteile", type: "array", of: [defineArrayMember({type: "object", fields: [
        defineField({name: "title", title: "Titel", type: "string", validation: (rule) => rule.required().max(80)}),
        defineField({name: "description", title: "Beschreibung", type: "string", validation: (rule) => rule.required().max(180)}),
        defineField({name: "icon", title: "Illustration", type: "image", options: {hotspot: true}}),
        defineField({name: "iconAlt", title: "Illustrations-Alt-Text", type: "string", validation: (rule) => rule.max(120)}),
        defineField({name: "sortOrder", title: "Sortierreihenfolge", type: "number", initialValue: 0}),
        defineField({name: "isVisible", title: "Anzeigen", type: "boolean", initialValue: true}),
      ]})]}),
    ]}),
    defineField({name: "contact", title: "Wir sind für dich da", type: "object", fields: [
      defineField({name: "heading", title: "Überschrift", type: "string", validation: (rule) => rule.max(100)}),
      defineField({name: "description", title: "Beschreibung", type: "text", rows: 4, validation: (rule) => rule.max(600)}),
      defineField({name: "image", title: "Produktfoto", type: "image", options: {hotspot: true}}),
      defineField({name: "imageAlt", title: "Bild-Alt-Text", type: "string", validation: (rule) => rule.max(160)}),
      defineField({name: "ctaLabel", title: "CTA-Beschriftung", type: "string", validation: (rule) => rule.max(50)}),
      defineField({name: "ctaHref", title: "CTA-Linkziel", type: "string", validation: linkValidation}),
    ]}),
  ],
  preview: {prepare: () => ({title: "Über uns", subtitle: "Hero, Geschichte, Galerie und Vorteile"})},
});
