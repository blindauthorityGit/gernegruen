import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

export const bakeryCatalog = defineType({
  name: "bakeryCatalog",
  title: "Backwarensortiment",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({ name: "title", title: "Interner Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "sourceFileName", title: "Letzte Importdatei", type: "string", readOnly: true, description: "Wird später durch den serverseitigen Excel-Import gesetzt." }),
    defineField({ name: "categories", title: "Kategorien", type: "array", of: [defineArrayMember({ type: "bakeryCategory" })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { select: { title: "title", categories: "categories" }, prepare: ({ title, categories }) => ({ title, subtitle: `${categories?.length ?? 0} Kategorien` }) },
});
