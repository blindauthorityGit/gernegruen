import {buildLegacyTheme, defineConfig} from "sanity"
import {structureTool} from "sanity/structure"
import {presentationTool} from "sanity/presentation"

import {schemaTypes} from "./sanity/schemaTypes"
import {structure} from "./sanity/structure"
import {ProduceImportTool} from "./components/studio/ProduceImportTool"
import {BakeryCatalogImportTool} from "./components/studio/BakeryCatalogImportTool"
import {TagIcon} from "@sanity/icons/Tag"
import {ClipboardIcon} from "@sanity/icons/Clipboard"
import {OrdersDashboardTool} from "./components/studio/OrdersDashboardTool"
import {resolve} from "./sanity/presentation/resolve"
import {DocumentsIcon} from "@sanity/icons/Documents"
import {EditIcon} from "@sanity/icons/Edit"
import {StudioToolMenu} from "./components/studio/StudioToolMenu"

const siteUrl = process.env.NEXT_PUBLIC_SANITY_PREVIEW_URL || (
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://gernegruen.de"
)

export default defineConfig({
  name: "default",
  title: "GerneGrün",
  projectId: "zqaggz4f",
  dataset: "production",
  basePath: "/studio",
  theme: buildLegacyTheme({
    "--font-family-base": "var(--font-nunito), Nunito, Arial, sans-serif",
    "--black": "#2e2e2e",
    "--white": "#fcf7ee",
    "--brand-primary": "#177142",
    "--component-bg": "#fbf5eb",
    "--component-text-color": "#2e2e2e",
    "--default-button-color": "#08522b",
    "--default-button-primary-color": "#177142",
    "--default-button-success-color": "#1a693c",
    "--default-button-warning-color": "#f1820c",
    "--default-button-danger-color": "#a94432",
    "--focus-color": "#08522b",
    "--gray-base": "#596358",
    "--gray": "#6b7469",
    "--main-navigation-color": "#08522b",
    "--main-navigation-color--inverted": "#fcf7ee",
    "--state-info-color": "#2a6a43",
    "--state-success-color": "#1a693c",
    "--state-warning-color": "#f1820c",
    "--state-danger-color": "#a94432",
  }),
  plugins: [
    structureTool({structure, title: "Inhalte", icon: DocumentsIcon}),
    presentationTool({
      title: "Live-Bearbeitung",
      icon: EditIcon,
      resolve,
      previewUrl: {
        initial: siteUrl,
        previewMode: {enable: "/api/draft-mode/enable"},
      },
    }),
  ],
  tools: [
    {name: "produce-import", title: "Produktlisten importieren", icon: TagIcon, component: ProduceImportTool},
    {name: "bakery-catalog-import", title: "Backwaren importieren", icon: DocumentsIcon, component: BakeryCatalogImportTool},
    {name: "orders-dashboard", title: "Bestellungen & Wünsche", icon: ClipboardIcon, component: OrdersDashboardTool},
  ],
  studio: {components: {toolMenu: StudioToolMenu}},
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !["startPage", "storeIntroSettings", "assortmentPage", "aboutPage", "contactPage", "businessSettings", "weeklyPageSettings"].includes(schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) =>
      ["startPage", "storeIntroSettings", "assortmentPage", "aboutPage", "contactPage", "businessSettings", "weeklyPageSettings"].includes(schemaType)
        ? actions.filter(({action}) => action !== "delete" && action !== "duplicate")
        : actions,
  },
})
