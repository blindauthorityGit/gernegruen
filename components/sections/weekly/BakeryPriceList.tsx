import { Container } from "@/components/layout/Container";
import { PreorderCTA } from "@/components/cta/PreorderCTA";
import { Heading } from "@/components/ui/Heading";
import type { BakeryCategory } from "@/lib/weekly/types";
import { formatEuroPrice } from "@/lib/weekly/format";

import styles from "./WeeklySections.module.css";
import type {WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

export function BakeryPriceList({categories, settings, catalogId}: {categories: BakeryCategory[]; settings?: WeeklyPageSettings; catalogId?: string}) {
  return (
    <section className={styles.priceSection} id="backwaren" aria-labelledby="bakery-price-title">
      <Container>
        <div className={styles.priceHeader}>
          <Heading id="bakery-price-title" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "priceListHeading")}>{settings?.priceListHeading || "Backwaren & Preise"}</Heading>
          <p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "priceListDescription")}>{settings?.priceListDescription || "Alle Preise inklusive Mehrwertsteuer. Das Angebot kann je nach Liefertag und Verfügbarkeit variieren."}</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <details className={styles.category} key={category._key} open={index < 2}>
              <summary data-sanity={catalogId ? sanityDataAttribute(catalogId, "bakeryCatalog", `categories[_key=="${category._key}"]`) : undefined}><span>{category.title}</span><span className={styles.toggle} aria-hidden="true">+</span></summary>
              <ul>{category.products.map((product) => <li key={product._key} data-sanity={catalogId ? sanityDataAttribute(catalogId, "bakeryCatalog", `categories[_key=="${category._key}"].products[_key=="${product._key}"]`) : undefined}><span>{product.name}{product.note && <small>{product.note}</small>}</span><strong>{formatEuroPrice(product.price)}</strong></li>)}</ul>
            </details>
          ))}
        </div>
        <PreorderCTA eyebrow={settings?.preorderEyebrow} heading={settings?.preorderHeading} text={settings?.preorderDescription} buttonLabel={settings?.preorderButtonLabel} />
      </Container>
    </section>
  );
}
