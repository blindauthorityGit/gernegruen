import { TagIcon } from "@sanity/icons/Tag";
import { defineArrayMember, defineField, defineType } from "sanity";

export const weeklyProduceItem = defineType({
  name: "weeklyProduceItem",
  title: "Obst- oder Gemüseartikel",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({ name: "name", title: "Produkt", type: "string", validation: (rule) => rule.required().max(100) }),
    defineField({ name: "note", title: "Hinweis", type: "string", description: "Optionaler konkreter Produktzusatz. Herkunft nur mit Produktbezug und belegter Lieferantenangabe eintragen; keine pauschalen Aussagen zur gesamten Gruppe.", validation: (rule) => rule.max(80) }),
  ],
  preview: { select: { title: "name", subtitle: "note" } },
});

export const weeklyProduceGroup = defineType({
  name: "weeklyProduceGroup",
  title: "Obst- oder Gemüsegruppe",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({ name: "title", title: "Gruppenname", type: "string", validation: (rule) => rule.required().max(60) }),
    defineField({ name: "items", title: "Produkte", type: "array", of: [defineArrayMember({ type: "weeklyProduceItem" })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { select: { title: "title", items: "items" }, prepare: ({ title, items }) => ({ title, subtitle: `${items?.length ?? 0} Produkte` }) },
});
