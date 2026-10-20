import {CogIcon} from "@sanity/icons/Cog"
import {CalendarIcon} from "@sanity/icons/Calendar"
import {DocumentIcon} from "@sanity/icons/Document"
import {DocumentsIcon} from "@sanity/icons/Documents"
import {HomeIcon} from "@sanity/icons/Home"
import {SparklesIcon} from "@sanity/icons/Sparkles"
import {TagIcon} from "@sanity/icons/Tag"
import {PinIcon} from "@sanity/icons/Pin"
import type {StructureResolver} from "sanity/structure"

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
                .title("Ein Laden mit Herz")
                .icon(HomeIcon)
                .child(S.document().schemaType("storeIntroSettings").documentId("storeIntroSettings").title("Ein Laden mit Herz")),
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
              S.listItem().title("Seitentexte: Diese Woche").icon(CalendarIcon).child(S.document().schemaType("weeklyPageSettings").documentId("weeklyPageSettings").title("Seitentexte: Diese Woche")),
              S.documentTypeListItem("nextWeekPreview").title("Nächste Woche").icon(CalendarIcon),
            ]),
        ),
      S.divider(),
      S.listItem().title("EINSTELLUNGEN").icon(CogIcon).child(
        S.list().title("Einstellungen").items([
          S.listItem().title("Geschäftsdaten").icon(CogIcon).child(S.document().schemaType("businessSettings").documentId("businessSettings").title("Geschäftsdaten")),
          S.listItem().title("Footer").icon(DocumentIcon).child(S.document().schemaType("footerSettings").documentId("footerSettings").title("Footer")),
        ]),
      ),
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
              S.listItem().title("Brot & Süßgebäck").icon(DocumentsIcon).child(
                S.document().schemaType("bakeryCatalog").documentId("bakeryCatalog-main").title("Brot & Süßgebäck"),
              ),
              S.documentTypeListItem("promotionSheet").title("Aktionsblätter").icon(DocumentIcon),
              S.listItem().title("Obst- & Gemüselisten").icon(CalendarIcon).child(S.documentTypeList("weeklyProduceList").title("Obst- & Gemüselisten")),
            ]),
        ),
    ])
