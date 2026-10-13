import Image from "next/image"

import {Reveal} from "@/components/motion/Reveal"

import styles from "./WeeklyBakeryCards.module.css"

export type WeeklyBakeryCardData = {
  title: string
  name: string
  description?: string
  image: {src: string; alt: string}
}

export function WeeklyBakeryCards({
  items,
  layout = "grid",
  className,
}: {
  items: WeeklyBakeryCardData[]
  layout?: "grid" | "stack"
  className?: string
}) {
  return (
    <div className={[styles.cards, className].filter(Boolean).join(" ")} data-layout={layout}>
      {items.map((item, index) => (
        <Reveal delay={index * 0.1} key={`${item.title}-${item.name}`}>
          <article className={styles.card} data-tone={index === 1 ? "cake" : "bread"}>
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
                src={item.image.src}
              />
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  )
}
