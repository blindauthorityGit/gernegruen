import Image from "next/image";
import {createImageUrlBuilder} from "@sanity/image-url";
import {Button} from "./Button";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import styles from "./AssortmentCard.module.css";

export type AssortmentCardData = {
  _key: string;
  _source?: {id: string; type: string; path: string};
  title: string;
  image: {src: string; alt: string; crop?: {top: number; bottom: number; left: number; right: number}; hotspot?: {x: number; y: number; width: number; height: number}};
  intro?: string;
  badgeText?: string;
  marker: "leaf" | "bread" | "promotion";
  entries?: {_key: string; title: string; description?: string; ingredients?: string; price?: number}[];
  note?: string;
  cta?: {label: string; href: string};
};

const markers = {leaf: "leaf", bread: "bakery", promotion: "promotion"};
const imageBuilder = createImageUrlBuilder({projectId: "zqaggz4f", dataset: "production"});
const priceFormatter = new Intl.NumberFormat("de-AT", {style: "currency", currency: "EUR"});

export function AssortmentCard({data, variant = "default"}: {data: AssortmentCardData; variant?: "default" | "compact"}) {
  const marker = stegaClean(data.marker);
  const imageUrl = data.image?.src ? stegaClean(data.image.src) : undefined;
  const remote = imageUrl?.startsWith("https://cdn.sanity.io/");
  const src = remote ? imageBuilder.image({asset: {url: imageUrl}, crop: data.image.crop, hotspot: data.image.hotspot}).width(1200).fit("max").auto("format").url() : imageUrl;
  return <article className={styles.card} data-variant={variant}>
    {src && <div className={styles.image} data-sanity={data._source ? sanityDataAttribute(data._source.id, data._source.type, data._source.path) : undefined}><Image alt={data.image.alt ?? ""} fill src={src} unoptimized={remote} sizes="(max-width: 767px) 90vw, (max-width: 1023px) 44vw, (max-width: 1535px) 29vw, 440px" />{data.badgeText && <span className={styles.imageBadge}>{data.badgeText}</span>}</div>}
    <h3 className={styles.title}>{data.title}</h3>
    {data.intro && <p className={styles.note}>{data.intro}</p>}
    {variant === "default" && !!data.entries?.length && <ul className={styles.entries}>
      {data.entries.map(entry => <li key={entry._key}>
        <Image alt="" aria-hidden="true" width={20} height={20} src={`/graphics/assortment-${markers[marker as keyof typeof markers] ?? "leaf"}-marker.png`} />
        <div>{entry.title}{entry.description && <span className={styles.detail}>{entry.description}</span>}{typeof entry.price === "number" && <span className={styles.detail}>{priceFormatter.format(entry.price)}</span>}</div>
      </li>)}
    </ul>}
    {variant === "compact" && <p className={styles.examples}>{[...new Set((data.entries ?? []).map((entry) => entry.title.trim()).filter((title) => title && !/und vieles mehr/i.test(title)))].join(" · ")}<em>und vieles mehr ...</em></p>}
    {data.note && <p className={styles.note}>{data.note}</p>}
    {data.cta && <Button variant={variant === "compact" ? "text" : "outline"} className={styles.cta} href={stegaClean(data.cta.href)}>{data.cta.label}<Image alt="" width={11} height={11} src="/icons/arrow-right.svg" /></Button>}
  </article>;
}
