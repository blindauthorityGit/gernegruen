import {defineArrayMember, defineField, defineType} from "sanity"

export const storeIntroHighlight = defineType({
  name: "storeIntroHighlight",
  title: "Laden-Highlight",
  type: "object",
  fields: [
    defineField({name: "title", title: "Hervorgehobener Text", type: "string", validation: rule => rule.required().max(100)}),
    defineField({name: "description", title: "Ergänzung", type: "string", validation: rule => rule.required().max(160)}),
  ],
  preview: {select: {title: "title", subtitle: "description"}},
})

export const storeCategory = defineType({
  name: "storeCategory",
  title: "Sortimentsbereich auf der Startseite",
  type: "object",
  fields: [
    defineField({name: "title", title: "Bezeichnung", type: "string", validation: rule => rule.required().max(50)}),
    defineField({
      name: "icon",
      title: "Illustration",
      type: "string",
      options: {
        list: [
          {title: "Obst & Gemüse", value: "produce"},
          {title: "Brot & Gebäck", value: "bakery"},
          {title: "Molkerei", value: "dairy"},
          {title: "Getränke", value: "drinks"},
          {title: "Vorrat & Küche", value: "pantry"},
          {title: "Süßes & Snacks", value: "snacks"},
          {title: "Natur & Körperpflege", value: "personalCare"},
        ],
      },
      validation: rule => rule.required(),
    }),
  ],
  preview: {select: {title: "title", subtitle: "icon"}},
})

export const storeIntroSection = defineType({
  name: "storeIntroSection",
  title: "Laden-Einleitung",
  type: "object",
  fields: [
    defineField({name: "headingLine1", title: "Überschrift, Zeile 1", type: "string", validation: rule => rule.required().max(40)}),
    defineField({name: "headingLine2", title: "Überschrift, Zeile 2", type: "string", validation: rule => rule.required().max(40)}),
    defineField({name: "description", title: "Einleitungstext", type: "text", rows: 3, validation: rule => rule.required().max(300)}),
    defineField({name: "imageAlt", title: "Alternativtext Ladenfoto", type: "string", validation: rule => rule.required().max(160)}),
    defineField({name: "image", title: "Ladenfoto", type: "image", options: {hotspot: true}}),
    defineField({name: "parkingText", title: "Parkhinweis", type: "string", validation: rule => rule.required().max(60)}),
    defineField({name: "highlights", title: "Highlights", type: "array", of: [defineArrayMember({type: "storeIntroHighlight"})], validation: rule => rule.required().min(1).max(3)}),
    defineField({name: "categories", title: "Sortimentsbereiche", type: "array", of: [defineArrayMember({type: "storeCategory"})], validation: rule => rule.required().min(1).max(7)}),
    defineField({name: "cta", title: "Sortiment-Button", type: "contentLink", validation: rule => rule.required()}),
  ],
})
