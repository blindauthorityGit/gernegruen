import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Heading } from "@/components/ui/Heading";
import type { PromotionSheet } from "@/lib/weekly/types";

import styles from "./WeeklySections.module.css";

export function WeeklyPromotions({ sheet }: { sheet: PromotionSheet | null }) {
  return (
    <section className={styles.promotionSection} id="aktionen" aria-labelledby="promotions-title">
      <Container>
        <div className={styles.promotionIntro}>
          <Heading id="promotions-title">Aktuelle Aktionen</Heading>
          <p>Entdecke unsere aktuellen Angebote und besonderen Aktionen im Laden.</p>
        </div>
        {sheet?.pdfUrl ? (
          <div className={styles.pdfLayout}>
            <div className={styles.pdfFrame}>
              <object aria-label={sheet.title} data={`${sheet.pdfUrl}#view=FitH`} type="application/pdf">
                <p>Die PDF-Vorschau wird von deinem Browser nicht unterstützt.</p>
              </object>
            </div>
            <aside className={styles.pdfInfo}>
              <span className={styles.pdfBadge}>{sheet.validLabel}</span>
              <h3>{sheet.title}</h3>
              <p>{sheet.description}</p>
              <div className={styles.pdfActions}>
                <Button href={sheet.pdfUrl} target="_blank">Aktionsblatt öffnen</Button>
                <Button download href={sheet.pdfUrl} variant="outline">PDF herunterladen</Button>
              </div>
              <p className={styles.pdfNote}>Auf dem Smartphone öffnet sich das Aktionsblatt bequem in einem neuen Fenster.</p>
            </aside>
          </div>
        ) : (
          <div className={styles.emptyPdf}><h3>Derzeit ist kein Aktionsblatt verfügbar.</h3><p>Schau bald wieder vorbei oder frag uns direkt im Laden nach aktuellen Angeboten.</p></div>
        )}
      </Container>
    </section>
  );
}
