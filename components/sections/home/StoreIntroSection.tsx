import Image from "next/image";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import styles from "./StoreIntroSection.module.css";

const categoryImages = {
  produce: "/graphics/sortiment-icon-obst-gemuese.png",
  bakery: "/graphics/sortiment-icon-brot.png",
  dairy: "/graphics/sortiment-icon-molkerei.png",
  drinks: "/graphics/sortiment-icon-getraenke.png",
  pantry: "/graphics/sortiment-icon-vorrat.png",
  snacks: "/graphics/sortiment-icon-snacks.png",
  personalCare: "/graphics/sortiment-icon-koerperpflege.png",
} as const;

type StoreCategoryIcon = keyof typeof categoryImages;

export type StoreIntroSectionData = {
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  imageAlt?: string;
  imageUrl?: string;
  parkingText?: string;
  highlights?: { _key?: string; title: string; description: string }[];
  categories?: { _key?: string; title: string; icon: StoreCategoryIcon }[];
  cta?: { label?: string; href?: string };
};

const defaultData: StoreIntroSectionData = {
  headingLine1: "Ein Laden",
  headingLine2: "mit Herz.",
  description: "Bei GerneGrün findest du vieles für deinen täglichen Einkauf – sorgfältig ausgewählt und persönlich.",
  imageAlt: "Blick in den GerneGrün Laden mit Brot und frischen Produkten an der Verkaufstheke",
  parkingText: "Freie Parkplätze\nim Hof",
  highlights: [
    { title: "Über 4.000 Produkte", description: "für deinen täglichen Einkauf" },
    { title: "Frisches, Brot, Käse, Getränke, Naturkosmetik", description: "und vieles mehr." },
  ],
  categories: [
    { title: "Obst &\nGemüse", icon: "produce" },
    { title: "Brot &\nGebäck", icon: "bakery" },
    { title: "Molkereiprodukte\n& Alternativen", icon: "dairy" },
    { title: "Getränke", icon: "drinks" },
    { title: "Vorrat &\nKüche", icon: "pantry" },
    { title: "Süßes &\nSnacks", icon: "snacks" },
    { title: "Natur &\nKörperpflege", icon: "personalCare" },
  ],
  cta: { label: "Zum gesamten Sortiment", href: "/sortiment" },
};

export function StoreIntroSection({ data }: { data?: StoreIntroSectionData | null }) {
  const content = { ...defaultData, ...data };
  const highlights = content.highlights ?? defaultData.highlights ?? [];
  const categories = (content.categories ?? defaultData.categories ?? []).filter(
    (category): category is NonNullable<StoreIntroSectionData["categories"]>[number] & { icon: StoreCategoryIcon } => stegaClean(category.icon) in categoryImages,
  );
  const cta = { ...defaultData.cta, ...content.cta };

  return (
    <section className={styles.section} aria-labelledby="store-intro-heading" data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content")}>
      <div className={styles.background} aria-hidden="true" />
      <Container>
        <div className={styles.intro}>
          <div className={styles.photoWrap}>
            <Image className={styles.photo} src={content.imageUrl || "/images/store-interior.png"} alt={content.imageAlt ?? ""} fill sizes="(max-width: 767px) 88vw, (max-width: 1100px) 44vw, 460px" unoptimized={Boolean(content.imageUrl)} data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content.image")} />
            <p className={styles.parking} data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content.parkingText")}>{content.parkingText}</p>
          </div>
          <div className={styles.copy}>
            <h2 id="store-intro-heading" data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content.headingLine1")}>{content.headingLine1}<br /><span data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content.headingLine2")}>{content.headingLine2}</span><span className={styles.spark} aria-hidden="true"><i /><i /><i /></span></h2>
            <p className={styles.description} data-sanity={sanityDataAttribute("storeIntroSettings", "storeIntroSettings", "content.description")}>{content.description}</p>
            <div className={styles.highlights}>
              {highlights.map((highlight, index) => <p key={highlight._key ?? `${highlight.title}-${index}`} data-sanity={highlight._key ? sanityDataAttribute("storeIntroSettings", "storeIntroSettings", `content.highlights[_key=="${highlight._key}"]`) : undefined}><strong>{highlight.title}</strong> {highlight.description}</p>)}
            </div>
          </div>
        </div>
        <ul className={styles.categories} aria-label="Unser Sortiment">
          {categories.map((category) => (
              <li className={styles.category} key={category._key ?? category.icon} data-sanity={category._key ? sanityDataAttribute("storeIntroSettings", "storeIntroSettings", `content.categories[_key=="${category._key}"]`) : undefined}>
              <Image src={categoryImages[stegaClean(category.icon)]} alt="" width={132} height={132} sizes="(max-width: 767px) 26vw, 132px" />
              <span>{category.title}</span>
            </li>
          ))}
        </ul>
        {cta.href && <Button className={styles.cta} href={cta.href} variant="primary">{cta.label} <Image className={styles.ctaArrow} src="/icons/arrow-right.svg" alt="" width={14} height={14} /></Button>}
      </Container>
    </section>
  );
}
