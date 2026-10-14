import {defineField, defineType} from "sanity"

export const storeIntroSettings = defineType({
  name: "storeIntroSettings",
  title: "Laden-Einleitung",
  type: "document",
  fields: [
    defineField({
      name: "content",
      title: "Ein Laden mit Herz",
      type: "storeIntroSection",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({title: "Ein Laden mit Herz", subtitle: "Startseite · Ladenfoto, Texte und Sortimentsbereiche"}),
  },
})
