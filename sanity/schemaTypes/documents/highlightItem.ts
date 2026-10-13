import {SparklesIcon} from "@sanity/icons/Sparkles"
import {defineField, defineType, type StringRule} from "sanity"

const linkValidation = (rule: StringRule) =>
  rule.required().custom((value) => {
    if (typeof value !== "string") return true
    return /^(\/|https?:\/\/)/.test(value) || "Bitte einen internen Pfad oder eine vollständige URL eingeben."
  })

export const highlightItem = defineType({
  name: "highlightItem",
  title: "Aktuelles & Aktionen",
  type: "document",
  icon: SparklesIcon,
  fields: [
    defineField({
      name: "internalTitle",
      title: "Interner Titel",
      type: "string",
      description: "Nur zur eindeutigen Identifikation in Sanity.",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "title",
      title: "Öffentlicher Titel",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {source: "title", maxLength: 96},
    }),
    defineField({
      name: "contentCategory",
      title: "Kategorie",
      type: "reference",
      to: [{type: "contentCategory"}],
      description: "Zentrale Kategorie für Beschriftung und Farbvariante.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Frühere Kategorie (nicht mehr verwenden)",
      type: "string",
      deprecated: {reason: "Die Kategorie wird jetzt über das Feld Kategorie referenziert."},
      readOnly: true,
      hidden: ({value}) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "badgeLabel",
      title: "Frühere Badge-Beschriftung (nicht mehr verwenden)",
      type: "string",
      deprecated: {reason: "Die Kurzbezeichnung wird jetzt zentral in der Kategorie gepflegt."},
      readOnly: true,
      hidden: ({value}) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "description",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "image",
      title: "Bild",
      type: "image",
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageAlt",
      title: "Alternativtext",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button-Beschriftung",
      type: "string",
      initialValue: "Mehr erfahren",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "ctaHref",
      title: "Link-Ziel",
      type: "string",
      description: "Interner Pfad oder vollständige externe URL.",
      validation: linkValidation,
    }),
    defineField({name: "startDate", title: "Startdatum", type: "date"}),
    defineField({name: "endDate", title: "Enddatum", type: "date"}),
    defineField({
      name: "isActive",
      title: "Sichtbar",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: "internalTitle", subtitle: "title", media: "image"},
  },
})
