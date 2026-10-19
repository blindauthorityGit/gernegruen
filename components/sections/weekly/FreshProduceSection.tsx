import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Heading } from "@/components/ui/Heading";
import { categorizeProduce, getProductBrand, produceCategoryOrder, type WeeklyProduceList } from "@/lib/weekly/produce-data";

import styles from "./WeeklySections.module.css";
import type {WeeklyPageSettings} from "@/sanity/queries/weeklyPageSettings";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

const priceFormatter = new Intl.NumberFormat("de-AT", {style: "currency", currency: "EUR"});

export function FreshProduceSection({list, settings}: {list: WeeklyProduceList | null; settings?: WeeklyPageSettings}) {
  const groups = list ? produceCategoryOrder.map((category) => ({
    ...category,
    products: list.products.filter((product) => categorizeProduce(product) === category.id),
  })).filter((category) => category.products.length > 0) : [];

  return (
    <section className={styles.produceSection} id="frisches" aria-labelledby="fresh-produce-title">
      <Container>
        <Reveal className={styles.sectionIntro}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <Image alt="" height={2048} sizes="(max-width: 760px) 90px, 140px" src="/graphics/weekly-fresh-produce-icon.png" width={2048} />
            </span>
            <Heading id="fresh-produce-title" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "produceHeading")}>{settings?.produceHeading || "Frisches Obst & Gemüse"}</Heading>
          </div>
          <p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "produceDescription")}>{settings?.produceDescription || "Unsere Auswahl wechselt mit Saison und Verfügbarkeit. Was du hier siehst, ist in dieser Woche frisch für dich da."}</p>
        </Reveal>
        {list ? <>
          <p className={styles.produceWeek}>Unser Obst & Gemüse der Woche – KW {list.week}/{list.year}</p>
          <div className={styles.produceLayout}>
            {groups.map((group, index) => (
              <Reveal className={styles.produceGroup} delay={index * 0.06} key={group.id}>
                <h3>{group.title}</h3>
                <ul className={styles.produceProducts}>{group.products.map((product) => {
                  const unit = product.unitKind === "kg" || /^kg$/i.test(product.unit ?? "")
                    ? "pro kg"
                    : product.unitKind === "piece" || /^(stk|stück|stueck)$/i.test(product.unit ?? "")
                      ? "pro Stk."
                      : product.unit ? `pro ${product.unit}` : undefined;
                  const certification = product.certification?.trim();
                  return <li className={styles.produceProduct} key={product._key} data-sanity={list?._id ? sanityDataAttribute(list._id, "weeklyProduceList", `products[_key=="${product._key}"]`) : undefined}>
                    <div className={styles.produceDetails}>
                      <span className={styles.produceName}>{product.name.replace(/^b\*/i, "")}</span>
                      {(product.origin || product.originRegion || getProductBrand(product) || certification) && <div className={styles.produceMeta}>
                        {product.origin && <span className={styles.produceOrigin}>Herkunftsland: {product.origin}</span>}
                        {product.originRegion && <span className={styles.produceOrigin}>Herkunftsregion: {product.originRegion}</span>}
                        {getProductBrand(product) && <span className={styles.produceOrigin}>Marke: {getProductBrand(product)}</span>}
                        {certification && <span className={styles.produceOrigin}>{certification}</span>}
                      </div>}
                    </div>
                    <div className={styles.producePrice}>
                      <strong>{typeof product.price === "number" ? priceFormatter.format(product.price) : "Preis fehlt"}</strong>
                      {unit && <span>{unit}</span>}
                    </div>
                  </li>;
                })}</ul>
              </Reveal>
            ))}
          </div>
        </> : <p className={styles.produceEmpty} role="status" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "produceEmptyMessage")}>{settings?.produceEmptyMessage || "Unsere aktuelle Obst- und Gemüseliste wird gerade vorbereitet. Schau bald wieder vorbei!"}</p>}
      </Container>
    </section>
  );
}
