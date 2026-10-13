import {TagIcon} from "@sanity/icons/Tag"
import {defineField, defineType} from "sanity"

export const contentCategory = defineType({
  name: "contentCategory",
  title: "Kategorie",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Bezeichnung",
      type: "string",
      description: "Öffentliche Bezeichnung, z. B. Aktion oder Saisonal.",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Interne Kennung",
      type: "slug",
      description: "Wird automatisch aus der Bezeichnung erzeugt.",
      options: {source: "title", maxLength: 48},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortLabel",
      title: "Kurzbezeichnung",
      type: "string",
      description: "Optionaler kurzer Text für das Badge, z. B. AKTION oder SAISON.",
      validation: (rule) => rule.max(16),
    }),
    defineField({
      name: "styleVariant",
      title: "Farbvariante",
      type: "string",
      description: "Kontrollierte Farbgebung aus dem GerneGrün Designsystem.",
      options: {
        list: [
          {title: "Dunkelgrün", value: "green"},
          {title: "Orange", value: "orange"},
          {title: "Limettengrün", value: "lime"},
          {title: "Hellgrün", value: "lightGreen"},
        ],
        layout: "radio",
      },
      initialValue: "green",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: "title", subtitle: "shortLabel"},
  },
})
