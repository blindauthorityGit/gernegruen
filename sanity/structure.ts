import {CogIcon} from "@sanity/icons/Cog"
import {CalendarIcon} from "@sanity/icons/Calendar"
import {DocumentIcon} from "@sanity/icons/Document"
import {DocumentsIcon} from "@sanity/icons/Documents"
import {HomeIcon} from "@sanity/icons/Home"
import {SparklesIcon} from "@sanity/icons/Sparkles"
import {TagIcon} from "@sanity/icons/Tag"
import {PinIcon} from "@sanity/icons/Pin"
import {createElement} from "react"
import type {StructureResolver} from "sanity/structure"

function SettingsPlaceholder() {
  return createElement(
    "div",
    {style: {padding: "2rem", fontFamily: "sans-serif"}},
    "Weitere Website-Einstellungen werden hier später ergänzt.",
  )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("GerneGrün")
    .items([
      S.listItem()
        .title("SEITEN")
        .icon(DocumentIcon)
        .child(
          S.list()
            .title("Seiten")
            .items([
              S.listItem()
                .title("Startseite")
                .icon(HomeIcon)
                .child(
                  S.document()
                    .schemaType("startPage")
                    .documentId("startPage")
                    .title("Startseite"),
                ),
              S.listItem()
                .title("Sortimentsseite")
                .icon(TagIcon)
                .child(S.document().schemaType("assortmentPage").documentId("assortmentPage").title("Sortimentsseite")),
              S.listItem()
                .title("Über uns")
                .icon(DocumentIcon)
                .child(S.document().schemaType("aboutPage").documentId("aboutPage").title("Über uns")),
              S.listItem().title("Kontakt & Anfahrt").icon(PinIcon).child(S.document().schemaType("contactPage").documentId("contactPage").title("Kontakt & Anfahrt")),
              S.documentTypeListItem("weeklyOverview").title("Diese Woche").icon(CalendarIcon),
              S.documentTypeListItem("nextWeekPreview").title("Nächste Woche").icon(CalendarIcon),
            ]),
        ),
      S.divider(),
      S.listItem().title("Geschäftsdaten").icon(CogIcon).child(S.document().schemaType("businessSettings").documentId("businessSettings").title("Geschäftsdaten")),
      S.listItem().title("Obst- & Gemüselisten").icon(CalendarIcon).child(S.documentTypeList("weeklyProduceList").title("Obst- & Gemüselisten")),
      S.divider(),
      S.listItem()
        .title("INHALTE")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Inhalte")
            .items([
              S.documentTypeListItem("assortmentEdition").title("Sortimentsausgaben / Wochenplanung").icon(SparklesIcon),
              S.documentTypeListItem("assortmentCategory").title("Sortimentskategorien").icon(TagIcon),
              S.documentTypeListItem("supplierBrand").title("Marken und Hersteller").icon(DocumentsIcon),
              S.documentTypeListItem("bakeryCatalog").title("Backwarensortimente").icon(DocumentsIcon),
              S.documentTypeListItem("promotionSheet").title("Aktionsblätter").icon(DocumentIcon),
              S.documentTypeListItem("highlightItem")
                .title("Aktuelles / Highlights")
                .icon(SparklesIcon),
              S.documentTypeListItem("contentCategory").title("Kategorien").icon(TagIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("EINSTELLUNGEN")
        .icon(CogIcon)
        .child(S.component(SettingsPlaceholder).title("Einstellungen")),
    ])
