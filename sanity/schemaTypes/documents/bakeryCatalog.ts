import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

export const bakeryCatalog = defineType({
  name: "bakeryCatalog",
  title: "Backwarensortiment",
  type: "document",
  icon: DocumentIcon,
  groups: [
    {name: "bread", title: "Brot & Gebäck"},
    {name: "sweet", title: "Süßgebäck"},
    {name: "settings", title: "Allgemein", default: true},
  ],
  fields: [
    defineField({ name: "title", title: "Interner Name", type: "string", group: "settings", validation: (rule) => rule.required() }),
    defineField({ name: "sourceFileName", title: "Quelle (technisch)", type: "string", group: "settings", readOnly: true, hidden: true }),
    defineField({ name: "breadCategories", title: "Kategorien", group: "bread", description: "Brote, Brötchen und herzhafte Backwaren.", type: "array", of: [defineArrayMember({ type: "bakeryCategory" })], validation: (rule) => rule.required().min(1) }),
    defineField({ name: "sweetCategories", title: "Kategorien", group: "sweet", description: "Kuchen, süße Backwaren, Dauergebäck und Biskuitböden.", type: "array", of: [defineArrayMember({ type: "bakeryCategory" })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { select: { title: "title", breadCategories: "breadCategories", sweetCategories: "sweetCategories" }, prepare: ({ title, breadCategories, sweetCategories }) => ({ title, subtitle: `${breadCategories?.length ?? 0} Brot-Kategorien · ${sweetCategories?.length ?? 0} Süßgebäck-Kategorien` }) },
});
