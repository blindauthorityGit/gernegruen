import {LinkIcon} from "@sanity/icons/Link"
import {defineField, defineType} from "sanity"

export const contentLink = defineType({
  name: "contentLink", title: "Link", type: "object", icon: LinkIcon,
  fields: [
    defineField({name: "label", title: "Beschriftung", type: "string", validation: r => r.required().max(60)}),
    defineField({name: "href", title: "Link-Ziel", type: "string", description: "Interner Pfad oder vollständige https://-Adresse.", validation: r => r.required().custom(v => !v || /^(\/(?!\/)|https?:\/\/)/.test(v) || "Bitte einen internen Pfad oder eine vollständige URL eingeben.")}),
  ],
})
