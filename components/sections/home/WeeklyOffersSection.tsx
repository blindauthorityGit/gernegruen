import Image from "next/image";
import Link from "next/link";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import type { AssortmentSectionData } from "@/components/sections/AssortmentSection";
import type { AssortmentCardData } from "@/components/ui/AssortmentCard";
import {WeeklyBakeryCards, type WeeklyBakeryCardData} from "@/components/ui/WeeklyBakeryCards";
import {getProductBrand, getProduceTeaserProducts, type WeeklyProduceList} from "@/lib/weekly/produce-data";
import styles from "./WeeklyOffersSection.module.css";

const priceFormatter = new Intl.NumberFormat("de-AT", {style: "currency", currency: "EUR"});

function ActionLink({ card, fallback, className = "" }: { card?: AssortmentCardData; fallback: string; className?: string }) {
  if (!card?.cta) return null;
  return (
    <Link className={`${styles.actionLink} ${className}`} href={stegaClean(card.cta.href) || "/diese-woche#aktionen"}>
      {card.cta.label || fallback}
      <Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" />
    </Link>
  );
}

export function WeeklyOffersSection({ data, produceList, showDataHint = false }: { data: AssortmentSectionData | null; produceList: WeeklyProduceList | null; showDataHint?: boolean }) {
  if (!data && !produceList) {
    return <section className={styles.section} id="diese-woche" aria-labelledby="weekly-offers-heading">
      <Container>
        <h2 className={styles.heading} id="weekly-offers-heading">Diese Woche</h2>
        <p className={styles.emptyState}>Entdecke unsere aktuellen Produkte und Aktionen auf der Wochen-Seite.</p>
        {showDataHint && <p className={styles.emptyHint}>Sanity enthält derzeit weder ein Startseiten-Dokument noch eine Wochen-Ausgabe.</p>}
        <Link className={styles.allOffers} href="/diese-woche">Zur Diese Woche<Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" /></Link>
      </Container>
    </section>;
  }
  const produce = data?.cards.find((card) => stegaClean(card.marker) === "leaf");
  const bakery = data?.cards.find((card) => stegaClean(card.marker) === "bread");
  const promotions = data?.cards.find((card) => stegaClean(card.marker) === "promotion");
  const breadEntry = bakery?.entries?.find((entry) => /brot/i.test(stegaClean(entry.title)));
  const cakeEntry = bakery?.entries?.find((entry) => /kuchen/i.test(stegaClean(entry.title)));
  const promotionalEntries = promotions?.entries?.slice(0, 2) ?? [];
  const teaserProducts = getProduceTeaserProducts(produceList, 4);
  const bakeryCards: WeeklyBakeryCardData[] = [
    {
      title: "Brot der Woche",
      name: breadEntry?.description || breadEntry?.title || "Brot der Woche",
      image: {src: "/graphics/weekly-bread-illustration.png", alt: "Flache Illustration eines Brots"},
    },
    {
      title: "Kuchen der Woche",
      name: cakeEntry?.description || cakeEntry?.title || "Kuchen der Woche",
      image: {src: "/graphics/weekly-cake-illustration.png", alt: "Flache Illustration eines Kuchens"},
    },
  ];

  return (
    <section className={styles.section} id="diese-woche" aria-labelledby="weekly-offers-heading">
      <Container>
        <div className={styles.header}>
          <Reveal>
            {data?.topline && <p className={styles.topline}>{data.topline}</p>}
            <h2 className={styles.heading} id="weekly-offers-heading">{data?.heading || "Diese Woche"}</h2>
            {data?.description && <p className={styles.intro}>{data.description}</p>}
          </Reveal>
          {data?.callout && <Reveal className={styles.weekBadge}><span>{data.callout}</span></Reveal>}
        </div>

        <div className={styles.bento}>
          {(produce || produceList) && (
            <Reveal className={`${styles.produceWrap} ${!data ? styles.produceOnly : ""}`}>
              <article className={styles.produceCard} data-sanity={data && produce ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", `cards[_key=="${produce._key}"]`) : undefined}>
                <div className={styles.produceText}>
                  <p className={styles.eyebrow}>Unsere Obst- und Gemüseauswahl</p>
                  <h3>{produce?.title || "Frisches Obst & Gemüse"}</h3>
                  {produce?.intro && <p className={styles.tileIntro}>{produce.intro}</p>}
                  {teaserProducts.length > 0 ? <ul className={styles.produceList}>
                    {teaserProducts.map((product) => <li key={product._key} data-sanity={produceList?._id ? sanityDataAttribute(produceList._id, "weeklyProduceList", `products[_key=="${product._key}"]`) : undefined}>
                      <span>{stegaClean(product.name).replace(/^b\*/i, "")}{(getProductBrand(product) || product.certification || product.origin || product.originRegion) && <small>{[product.origin && `Herkunftsland: ${product.origin}`, product.originRegion && `Herkunftsregion: ${product.originRegion}`, getProductBrand(product) && `Marke: ${getProductBrand(product)}`, product.certification && `Lieferantenangabe: ${product.certification} · nicht unabhängig geprüft`].filter(Boolean).join(" · ")}</small>}</span>
                      {typeof product.price === "number" && <strong>{priceFormatter.format(product.price)}</strong>}
                    </li>)}
                  </ul> : null}
                  {!teaserProducts.length && <p className={styles.tileIntro}>Unsere aktuelle Auswahl wird gerade zusammengestellt.</p>}
                  <Link className={`${styles.actionLink} ${styles.produceActionLink}`} href="/diese-woche#frisches">UND VIELES MEHR<Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" /></Link>
                </div>
                <div className={styles.produceArt} aria-hidden="true">
                  <Image src="/graphics/gemuese.png" alt="" fill sizes="(max-width: 900px) 38vw, 320px" />
                </div>
                <span className={styles.produceOrb} aria-hidden="true" />
              </article>
            </Reveal>
          )}

          {bakery && <WeeklyBakeryCards className={styles.bakeryCards} items={bakeryCards} layout="stack" />}

          {promotions && (promotions.intro || promotionalEntries.length > 0) && (
            <Reveal className={styles.promotionWrap} delay={0.2}>
              <article className={styles.promotionCard}>
                <div className={styles.promotionHeading}>
                  <p className={styles.eyebrow}>Noch mehr zu entdecken</p>
                  <h3>{promotions.title}</h3>
                  {promotions.intro && <p>{promotions.intro}</p>}
                </div>
                {!!promotionalEntries.length && <ul className={styles.promotionList}>
                  {promotionalEntries.map((entry) => <li key={entry._key}><strong>{entry.title}</strong>{entry.description && <span>{entry.description}</span>}</li>)}
                </ul>}
                <ActionLink card={promotions} fallback="Alle Aktionen ansehen" />
                <span className={styles.promotionMark} aria-hidden="true">%</span>
              </article>
            </Reveal>
          )}
        </div>

        {data?.cta && !promotions && <Link className={styles.allOffers} href={data.cta.href}>{data.cta.label}<Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" /></Link>}
      </Container>
    </section>
  );
}
