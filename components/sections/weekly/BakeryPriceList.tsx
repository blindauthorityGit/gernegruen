import { Container } from "@/components/layout/Container";
import { PreorderCTA } from "@/components/cta/PreorderCTA";
import { Heading } from "@/components/ui/Heading";
import type { BakeryCategory } from "@/lib/weekly/types";
import { formatEuroPrice } from "@/lib/weekly/format";

import styles from "./WeeklySections.module.css";

export function BakeryPriceList({ categories }: { categories: BakeryCategory[] }) {
  return (
    <section className={styles.priceSection} id="backwaren" aria-labelledby="bakery-price-title">
      <Container>
        <div className={styles.priceHeader}>
          <Heading id="bakery-price-title">Backwaren & Preise</Heading>
          <p>Alle Preise inklusive Mehrwertsteuer. Das Angebot kann je nach Liefertag und Verfügbarkeit variieren.</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <details className={styles.category} key={category._key} open={index < 2}>
              <summary><span>{category.title}</span><span className={styles.toggle} aria-hidden="true">+</span></summary>
              <ul>{category.products.map((product) => <li key={product._key}><span>{product.name}{product.note && <small>{product.note}</small>}</span><strong>{formatEuroPrice(product.price)}</strong></li>)}</ul>
            </details>
          ))}
        </div>
        <PreorderCTA />
      </Container>
    </section>
  );
}
