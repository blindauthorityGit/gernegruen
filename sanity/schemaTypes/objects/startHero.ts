import {ImageIcon} from "@sanity/icons/Image"
import {defineField, defineType, type StringRule} from "sanity"

const linkValidation = (rule: StringRule) =>
  rule.required().custom((value) => {
    if (typeof value !== "string") return true
    return /^(\/|https?:\/\/)/.test(value) || "Bitte einen internen Pfad oder eine vollständige URL eingeben."
  })

const ctaFields = [
  defineField({
    name: "label",
    title: "Beschriftung",
    type: "string",
    validation: (rule) => rule.required().max(40),
  }),
  defineField({
    name: "href",
    title: "Link",
    type: "string",
    description: "Interner Pfad (z. B. /sortiment) oder vollständige externe URL.",
    validation: linkValidation,
  }),
]

export const startHero = defineType({
  name: "startHero",
  title: "Homepage Hero",
  type: "object",
  icon: ImageIcon,
  initialValue: {
    headlineLine1: "Gut versorgt",
    headlineLine2: "direkt in Dreieich",
    description: "Bei uns findest du Obst, Gemüse, Brot und mehr – persönlich ausgesucht und immer wieder neu.",
  },
  fields: [
    defineField({
      name: "headlineLine1",
      title: "Headline",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "headlineLine2",
      title: "Headline – zweite Zeile",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "contentTitle",
      title: "Teaser-Titel",
      type: "string",
      deprecated: {reason: "Der statische Hero verwendet nur Headline und Subline."},
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "description",
      title: "Subline / Beschreibung",
      type: "text",
      rows: 3,
      description: "Bei Bio-, Umwelt-, Nachhaltigkeits- oder Herkunftsaussagen den konkreten Bezug und belegbare Grundlage nennen. Allgemeine Aussagen wie „nachhaltig“ oder „aus der Region“ vermeiden.",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "primaryCta",
      title: "Primäre Aktion",
      type: "object",
      fields: ctaFields,
    }),
    defineField({
      name: "secondaryCta",
      title: "Sekundärer Link",
      type: "object",
      fields: ctaFields,
    }),
    defineField({
      name: "image",
      title: "Hero-Grafik",
      type: "image",
      description: "Optional. Ohne Upload wird das Ladenfoto aus dem Hero verwendet. Das Bild wird vollständig und ohne Beschnitt dargestellt.",
    }),
    defineField({
      name: "imageAlt",
      title: "Alternativtext",
      type: "string",
      description: "Beschreibt den Bildinhalt für Menschen, die das Bild nicht sehen können.",
      validation: (rule) => rule.max(160).custom((value, context) => {
        const parent = context.parent as {image?: {asset?: {_ref?: string}}} | undefined
        return !parent?.image?.asset?._ref || Boolean(value?.trim()) || "Bitte einen Alternativtext für die hochgeladene Grafik eingeben."
      }),
    }),
  ],
})
