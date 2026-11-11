import Image from "next/image";
import Link from "next/link";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import type {AssortmentEditionData, AssortmentPromotionPreview} from "@/sanity/types/assortment";
import {WeeklyBakeryCards, type WeeklyBakeryCardData} from "@/components/ui/WeeklyBakeryCards";
import {formatIsoWeekDateRange, getProductBrand, getProduceTeaserProducts, type WeeklyProduceList} from "@/lib/weekly/produce-data";
import styles from "./WeeklyOffersSection.module.css";

const priceFormatter = new Intl.NumberFormat("de-AT", {style: "currency", currency: "EUR"});

function ActionLink({ card, fallback, sourceId, className = "" }: { card?: AssortmentPromotionPreview; fallback: string; sourceId?: string; className?: string }) {
  if (!card?.cta) return null;
  return (
    <Link className={`${styles.actionLink} ${className}`} href={stegaClean(card.cta.href) || "/diese-woche#aktionen"} data-sanity={sourceId ? sanityDataAttribute(sourceId, "assortmentEdition", "promotionPreview.cta") : undefined}>
      <span data-sanity={sourceId ? sanityDataAttribute(sourceId, "assortmentEdition", "promotionPreview.cta.label") : undefined}>{card.cta.label || fallback}</span>
      <Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" />
    </Link>
  );
}

export function WeeklyOffersSection({ data, produceList, showDataHint = false }: { data: AssortmentEditionData | null; produceList: WeeklyProduceList | null; showDataHint?: boolean }) {
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
  const bakery = data?.bakeryHighlights;
  const promotions = data?.promotionPreview;
  const promotionalEntries = promotions?.entries?.slice(0, 2) ?? [];
  const teaserProducts = getProduceTeaserProducts(produceList, 4);
  const topline = data?.topline
    ? stegaClean(data.topline).trim().replace(/\s*[–—-]\s*\d{1,2}\.\s*(?:[–—-]\s*)?\d{1,2}\.\s+\p{L}+(?:\s+\d{4})?$/u, "").trim() || "Diese Woche bei uns"
    : "Diese Woche bei uns";
  // Illustrations are fixed design assets and are intentionally not editor-managed.
  const bakeryCards: WeeklyBakeryCardData[] = [
    {key: "bread", title: "Brot der Woche", image: {src: "/graphics/weekly-bread-illustration.png", alt: "Flache Illustration eines Brots"}},
    {key: "cake", title: "Kuchen der Woche", image: {src: "/graphics/weekly-cake-illustration.png", alt: "Flache Illustration eines Kuchens"}},
  ].map(({key, title, image}) => {
    const entry = bakery?.[key as "bread" | "cake"];
    return {
      _key: key,
      sanityPath: `bakeryHighlights.${key}`,
      title,
      name: entry?.title || title,
      description: entry?.ingredients,
      image,
    };
  });

  return (
    <section className={styles.section} id="diese-woche" aria-labelledby="weekly-offers-heading">
      <Container>
        <div className={styles.header}>
          <Reveal>
            {(data?.topline || produceList) && <p className={styles.topline} data-sanity={data?.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "topline") : undefined}>{produceList ? `${topline} – ${formatIsoWeekDateRange(produceList.week, produceList.year)}` : topline}</p>}
            <h2 className={styles.heading} id="weekly-offers-heading" data-sanity={data?.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "heading") : undefined}>{data?.heading || "Diese Woche"}</h2>
            {data?.description && <p className={styles.intro} data-sanity={data.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "description") : undefined}>{data.description}</p>}
          </Reveal>
          {produceList && <Reveal className={styles.weekBadge} data-sanity={produceList._id ? sanityDataAttribute(produceList._id, "weeklyProduceList", "week") : undefined}><span>KW {produceList.week}</span></Reveal>}
        </div>

        <div className={styles.bento}>
          {produceList && (
            <Reveal className={`${styles.produceWrap} ${!data ? styles.produceOnly : ""}`}>
              <article className={styles.produceCard}>
                <div className={styles.produceText}>
                  <p className={styles.eyebrow}>Unsere Obst- und Gemüseauswahl</p>
                  <h3>Obst & Gemüse</h3>
                  {teaserProducts.length > 0 ? <ul className={styles.produceList}>
                    {teaserProducts.map((product) => {
                      const certification = product.certification?.trim();
                      return <li key={product._key} data-sanity={produceList?._id ? sanityDataAttribute(produceList._id, "weeklyProduceList", `products[_key=="${product._key}"]`) : undefined}>
                      <span>{stegaClean(product.name).replace(/^b\*/i, "")}{(getProductBrand(product) || certification || product.origin || product.originRegion) && <small>{[product.origin && `Herkunftsland: ${product.origin}`, product.originRegion && `Herkunftsregion: ${product.originRegion}`, getProductBrand(product) && `Marke: ${getProductBrand(product)}`, certification].filter(Boolean).join(" · ")}</small>}</span>
                      {typeof product.price === "number" && <strong>{priceFormatter.format(product.price)}</strong>}
                    </li>})}
                  </ul> : null}
                  {!teaserProducts.length && <p className={styles.tileIntro}>Unsere aktuelle Auswahl wird gerade zusammengestellt.</p>}
                  <Link className={`${styles.actionLink} ${styles.produceActionLink}`} href="/diese-woche#frisches">UND VIELES MEHR<Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" /></Link>
                </div>
                <div className={styles.produceArt} aria-hidden="true">
                  {/* Fixed Figma artwork, independent from Sanity card images. */}
                  <Image src="/graphics/gemuese.png" alt="" fill sizes="(max-width: 900px) 38vw, 320px" />
                </div>
                <span className={styles.produceOrb} aria-hidden="true" />
              </article>
            </Reveal>
          )}

          {bakery && <WeeklyBakeryCards className={styles.bakeryCards} items={bakeryCards} layout="stack" sourceId={data?.id} />}

          {promotions && (promotions.intro || promotionalEntries.length > 0) && (
            <Reveal className={styles.promotionWrap} delay={0.2}>
              <article className={styles.promotionCard}>
                <div className={styles.promotionHeading}>
                  <p className={styles.eyebrow}>Noch mehr zu entdecken</p>
                  <h3 data-sanity={data?.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "promotionPreview.title") : undefined}>{promotions.title}</h3>
                  {promotions.intro && <p data-sanity={data?.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "promotionPreview.intro") : undefined}>{promotions.intro}</p>}
                </div>
                {!!promotionalEntries.length && <ul className={styles.promotionList}>
                  {promotionalEntries.map((entry) => <li key={entry._key} data-sanity={data?.id && entry._key ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", `promotionPreview.entries[_key=="${entry._key}"]`) : undefined}><strong>{entry.title}</strong>{entry.description && <span>{entry.description}</span>}</li>)}
                </ul>}
                <ActionLink card={promotions} fallback="Alle Aktionen ansehen" sourceId={data?.id} />
                <span className={styles.promotionMark} aria-hidden="true">%</span>
              </article>
            </Reveal>
          )}
        </div>

        {data?.cta && !promotions && <Link className={styles.allOffers} href={stegaClean(data.cta.href)} data-sanity={data.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "cta") : undefined}><span data-sanity={data.id ? sanityDataAttribute(data.id, data._type ?? "assortmentEdition", "cta.label") : undefined}>{data.cta.label}</span><Image alt="" aria-hidden="true" width={12} height={12} src="/icons/arrow-right.svg" /></Link>}
      </Container>
    </section>
  );
}
