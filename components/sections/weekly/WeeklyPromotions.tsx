import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Heading } from "@/components/ui/Heading";

import styles from "./WeeklySections.module.css";
import type {WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";

type PromotionEntry = { _id?: string; _key?: string; title: string; description?: string; validLabel?: string; dateRange?: string; pdfUrl?: string; isEnabled?: boolean; validFrom?: string; validUntil?: string };

export function WeeklyPromotions({sheets, settings, showInactive = false}: {sheets: PromotionEntry[]; settings?: WeeklyPageSettings; showInactive?: boolean}) {
  const today = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date());
  const currentSheets = sheets.filter((sheet) =>
    showInactive || (sheet.isEnabled !== false && (!sheet.validFrom || sheet.validFrom <= today) && (!sheet.validUntil || sheet.validUntil >= today)),
  );
  return (
    <section className={styles.promotionSection} id="aktionen" aria-labelledby="promotions-title">
      <Container>
        <div className={styles.promotionIntro}>
          <Heading id="promotions-title" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "promotionsHeading")}>{settings?.promotionsHeading || "Aktuelle Aktionen"}</Heading>
          <p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "promotionsDescription")}>{settings?.promotionsDescription || "Entdecke unsere aktuellen Angebote und besonderen Aktionen im Laden."}</p>
        </div>
        {currentSheets.length > 0 ? (
          <div className={styles.pdfCollection}>
            {currentSheets.map((sheet) => sheet.pdfUrl && (
              <article className={styles.pdfLayout} key={sheet._key ?? sheet._id ?? sheet.title}>
                <div className={styles.pdfFrame} data-sanity={sheet._key ? sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", `promotionSheets[_key=="${sheet._key}"].pdf`) : sheet._id ? sanityDataAttribute(sheet._id, "promotionSheet", "pdf") : undefined}>
                  <object aria-label={sheet.title} data={`${stegaClean(sheet.pdfUrl)}#view=FitH`} type="application/pdf">
                    <p>Die PDF-Vorschau wird von deinem Browser nicht unterstützt.</p>
                  </object>
                </div>
                <aside className={styles.pdfInfo}>
                  <span className={styles.pdfBadge} data-sanity={sheet._key ? sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", `promotionSheets[_key=="${sheet._key}"].dateRange`) : sheet._id ? sanityDataAttribute(sheet._id, "promotionSheet", "dateRange") : undefined}>{sheet.validLabel ?? sheet.dateRange}</span>
                  <h3 data-sanity={sheet._key ? sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", `promotionSheets[_key=="${sheet._key}"].title`) : sheet._id ? sanityDataAttribute(sheet._id, "promotionSheet", "title") : undefined}>{sheet.title}</h3>
                  {sheet.description && <p data-sanity={sheet._key ? sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", `promotionSheets[_key=="${sheet._key}"].description`) : sheet._id ? sanityDataAttribute(sheet._id, "promotionSheet", "description") : undefined}>{sheet.description}</p>}
                  <div className={styles.pdfActions}>
                    <Button href={stegaClean(sheet.pdfUrl)} target="_blank">Aktionsblatt öffnen</Button>
                    <Button download href={stegaClean(sheet.pdfUrl)} variant="outline">PDF herunterladen</Button>
                  </div>
                  <p className={styles.pdfNote}>Auf dem Smartphone öffnet sich das Aktionsblatt bequem in einem neuen Fenster.</p>
                </aside>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyPdf}><h3 data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "promotionsEmptyHeading")}>{settings?.promotionsEmptyHeading || "Derzeit ist kein Aktionsblatt verfügbar."}</h3><p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "promotionsEmptyDescription")}>{settings?.promotionsEmptyDescription || "Schau bald wieder vorbei oder frag uns direkt im Laden nach aktuellen Angeboten."}</p></div>
        )}
      </Container>
    </section>
  );
}
