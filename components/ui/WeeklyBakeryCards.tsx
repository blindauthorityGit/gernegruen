import Image from "next/image"

import {Reveal} from "@/components/motion/Reveal"

import styles from "./WeeklyBakeryCards.module.css"
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute"
import {stegaClean} from "next-sanity"

export type WeeklyBakeryCardData = {
  _key?: string
  sanityPath?: string
  title: string
  name: string
  description?: string
  image: {src: string; alt: string}
}

export function WeeklyBakeryCards({
  items,
  layout = "grid",
  className,
  sourceId,
  sourceType = "weeklyOverview",
}: {
  items: WeeklyBakeryCardData[]
  layout?: "grid" | "stack"
  className?: string
  sourceId?: string
  sourceType?: "weeklyOverview" | "weeklyPageSettings" | "assortmentEdition"
}) {
  return (
    <div className={[styles.cards, className].filter(Boolean).join(" ")} data-layout={layout}>
      {items.map((item, index) => (
        <Reveal delay={index * 0.1} key={`${item.title}-${item.name}`}>
          <article className={styles.card} data-tone={index === 1 ? "cake" : "bread"} data-sanity={sourceId && item._key ? sanityDataAttribute(sourceId, sourceType, item.sanityPath ?? `bakeryHighlights[_key=="${item._key}"]`) : undefined}>
            <div className={styles.copy}>
              <p className={styles.label}>{item.title}</p>
              <h3>{item.name}</h3>
              {item.description && <p className={styles.description}>{item.description}</p>}
            </div>
            <div className={styles.image}>
              <Image
                alt={item.image.alt}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                sizes={layout === "stack" ? "(max-width: 700px) 42vw, 260px" : "(max-width: 760px) 82vw, 38vw"}
                src={stegaClean(item.image.src)}
                data-sanity={sourceId && item._key && !item.sanityPath ? sanityDataAttribute(sourceId, sourceType, `bakeryHighlights[_key=="${item._key}"].image`) : undefined}
              />
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  )
}
