import {CogIcon} from "@sanity/icons/Cog";
import {defineArrayMember, defineField, defineType} from "sanity";

export const businessSettings = defineType({
  name: "businessSettings", title: "Geschäftsdaten", type: "document", icon: CogIcon,
  fields: [
    defineField({name: "businessName", title: "Geschäftsname", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "street", title: "Straße und Hausnummer", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "postalCode", title: "Postleitzahl", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "city", title: "Ort", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "legalName", title: "Rechtlicher Firmenname", type: "string", description: "Vollständige Firma einschließlich Rechtsform, wie im Handelsregister eingetragen."}),
    defineField({name: "authorizedRepresentatives", title: "Vertretungsberechtigte Personen", type: "array", of: [defineArrayMember({type: "object", fields: [
      defineField({name: "fullName", title: "Vollständiger Name", type: "string", validation: (rule) => rule.required()}),
      defineField({name: "role", title: "Funktion", type: "string"}),
    ]})]}),
    defineField({name: "representationNote", title: "Hinweis zur Vertretung", type: "string"}),
    defineField({name: "registerCourt", title: "Registergericht", type: "string"}),
    defineField({name: "registerNumber", title: "Registernummer", type: "string"}),
    defineField({name: "personallyLiablePartner", title: "Persönlich haftende Gesellschafterin", type: "string", description: "Bei einer GmbH & Co. KG die Komplementär-GmbH."}),
    defineField({name: "partnerRegisterCourt", title: "Registergericht der Komplementär-GmbH", type: "string"}),
    defineField({name: "partnerRegisterNumber", title: "Registernummer der Komplementär-GmbH", type: "string"}),
    defineField({name: "vatId", title: "Umsatzsteuer-Identifikationsnummer", type: "string"}),
    defineField({name: "organicCertification", title: "Bio-Zertifizierung", type: "text", rows: 3}),
    defineField({name: "organicControlBody", title: "Bio-Kontrollstelle", type: "string"}),
    defineField({name: "phone", title: "Telefonnummer", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "email", title: "E-Mail-Adresse", type: "string", validation: (rule) => rule.required().email()}),
    defineField({name: "instagramHandle", title: "Instagram-Profilname", type: "string"}),
    defineField({name: "legalSeo", title: "SEO für rechtliche Seiten", type: "object", fields: [
      defineField({name: "imprintTitle", title: "Impressum: SEO-Titel", type: "string", validation: rule => rule.max(70)}),
      defineField({name: "imprintDescription", title: "Impressum: SEO-Beschreibung", type: "text", rows: 2, validation: rule => rule.max(180)}),
      defineField({name: "privacyTitle", title: "Datenschutz: SEO-Titel", type: "string", validation: rule => rule.max(70)}),
      defineField({name: "privacyDescription", title: "Datenschutz: SEO-Beschreibung", type: "text", rows: 2, validation: rule => rule.max(180)}),
      defineField({name: "accessibilityTitle", title: "Barrierefreiheit: SEO-Titel", type: "string", validation: rule => rule.max(70)}),
      defineField({name: "accessibilityDescription", title: "Barrierefreiheit: SEO-Beschreibung", type: "text", rows: 2, validation: rule => rule.max(180)}),
    ]}),
    defineField({name: "coordinates", title: "Standortkoordinaten", type: "object", fields: [
      defineField({name: "latitude", title: "Breitengrad", type: "number", validation: (rule) => rule.required().min(-90).max(90)}),
      defineField({name: "longitude", title: "Längengrad", type: "number", validation: (rule) => rule.required().min(-180).max(180)}),
    ]}),
    defineField({name: "openingHours", title: "Reguläre Öffnungszeiten", type: "array", validation: (rule) => rule.required().min(7).max(7), of: [defineArrayMember({type: "object", fields: [
      defineField({name: "dayOfWeek", title: "Wochentag (ISO: Mo. 1 bis So. 7)", type: "number", validation: (rule) => rule.required().integer().min(1).max(7)}),
      defineField({name: "day", title: "Wochentag", type: "string", validation: (rule) => rule.required()}),
      defineField({name: "shortDay", title: "Kurzform", type: "string", validation: (rule) => rule.required()}),
      defineField({name: "isClosed", title: "Geschlossen", type: "boolean", initialValue: false}),
      defineField({name: "opens", title: "Öffnet um", type: "string", description: "Format HH:mm"}),
      defineField({name: "closes", title: "Schließt um", type: "string", description: "Format HH:mm"}),
    ]})]}),
    defineField({name: "exceptions", title: "Sonderöffnungszeiten und Feiertage", type: "array", of: [defineArrayMember({type: "object", fields: [
      defineField({name: "date", title: "Datum", type: "date", validation: (rule) => rule.required()}),
      defineField({name: "label", title: "Anlass", type: "string", validation: (rule) => rule.max(100)}),
      defineField({name: "isClosed", title: "Geschlossen", type: "boolean", initialValue: false}),
      defineField({name: "opens", title: "Öffnet um", type: "string", description: "Format HH:mm"}),
      defineField({name: "closes", title: "Schließt um", type: "string", description: "Format HH:mm"}),
    ]})]}),
  ],
  preview: {prepare: () => ({title: "Geschäftsdaten", subtitle: "Adresse, Kontakt und Öffnungszeiten"})},
});
