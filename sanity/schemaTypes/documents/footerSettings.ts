import {defineArrayMember, defineField, defineType} from "sanity";

export const footerSettings = defineType({
  name: "footerSettings",
  title: "Footer",
  type: "document",
  fields: [
    defineField({name: "openingHoursHeading", title: "Überschrift Öffnungszeiten", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "addressHeading", title: "Überschrift Adresse", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "linksHeading", title: "Überschrift Links", type: "string", validation: (rule) => rule.required()}),
    defineField({
      name: "legalLinks",
      title: "Footer-Links",
      type: "array",
      validation: (rule) => rule.min(1),
      of: [defineArrayMember({type: "object", fields: [
        defineField({name: "label", title: "Linktext", type: "string", validation: (rule) => rule.required()}),
        defineField({name: "href", title: "Ziel", type: "string", description: "Interner Pfad, zum Beispiel /impressum, oder eine vollständige https://-Adresse.", validation: (rule) => rule.required().custom((value) => !value || value.startsWith("/") || value.startsWith("https://") ? true : "Bitte einen internen Pfad oder eine HTTPS-Adresse eingeben.")}),
      ]})],
    }),
  ],
  preview: {prepare: () => ({title: "Footer", subtitle: "Globale Fußzeile der Website"})},
});
