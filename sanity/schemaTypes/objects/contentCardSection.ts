import {BlockContentIcon} from "@sanity/icons/BlockContent"
import {defineArrayMember, defineField, defineType, type StringRule} from "sanity"

const linkValidation = (rule: StringRule) =>
  rule.required().custom((value) => {
    if (typeof value !== "string") return true
    return /^(\/|https?:\/\/)/.test(value) || "Bitte einen internen Pfad oder eine vollständige URL eingeben."
  })

export const contentCardSection = defineType({
  name: "contentCardSection",
  title: "Kartenbereich",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Überschrift",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "intro",
      title: "Einleitung",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "sectionCta",
      title: "Bereichslink",
      type: "object",
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: "label",
          title: "Beschriftung",
          type: "string",
          validation: (rule) => rule.required().max(40),
        }),
        defineField({
          name: "href",
          title: "Link-Ziel",
          type: "string",
          validation: linkValidation,
        }),
      ],
    }),
    defineField({
      name: "selectedItems",
      title: "Ausgewählte Inhalte",
      type: "array",
      description: "Die Reihenfolge entspricht der Darstellung auf der Website.",
      of: [defineArrayMember({type: "reference", to: [{type: "highlightItem"}]})],
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
})
