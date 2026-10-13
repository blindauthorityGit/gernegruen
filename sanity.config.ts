import {defineConfig} from "sanity"
import {structureTool} from "sanity/structure"

import {schemaTypes} from "./sanity/schemaTypes"
import {structure} from "./sanity/structure"
import {ProduceImportTool} from "./components/studio/ProduceImportTool"
import {TagIcon} from "@sanity/icons/Tag"
import {ClipboardIcon} from "@sanity/icons/Clipboard"
import {OrdersDashboardTool} from "./components/studio/OrdersDashboardTool"

export default defineConfig({
  name: "default",
  title: "GerneGrün",
  projectId: "zqaggz4f",
  dataset: "production",
  basePath: "/studio",
  plugins: [structureTool({structure})],
  tools: [
    {name: "produce-import", title: "Produktlisten importieren", icon: TagIcon, component: ProduceImportTool},
    {name: "orders-dashboard", title: "Bestellungen & Wünsche", icon: ClipboardIcon, component: OrdersDashboardTool},
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !["startPage", "assortmentPage", "aboutPage", "contactPage", "businessSettings"].includes(schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) =>
      ["startPage", "assortmentPage", "aboutPage", "contactPage", "businessSettings"].includes(schemaType)
        ? actions.filter(({action}) => action !== "delete" && action !== "duplicate")
        : actions,
  },
})
