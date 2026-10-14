import Image from "next/image";
import {stegaClean} from "next-sanity";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { AssortmentCard, type AssortmentCardData } from "@/components/ui/AssortmentCard";
import styles from "./AssortmentDirectory.module.css";

export type AssortmentCategoryContent = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  examples?: string[];
  badgeText?: string;
  iconUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type AssortmentGroupContent = { key: string; title: string; categories: AssortmentCategoryContent[] };

export function AssortmentDirectory({ groups }: {groups: AssortmentGroupContent[]}) {
  const visibleGroups = groups.filter((group) => group.categories.length > 0);
  const categories = visibleGroups.flatMap((group) => group.categories);
  return <>
    {!!categories.length && <nav className={styles.navigation} aria-label="Sortimentskategorien">
      <Container><ul className={styles.navList}>{categories.map((category) => <li key={category._id}>
        <a className={styles.navLink} href={`#${stegaClean(category.slug)}`}>
          <span className={styles.navIcon}>{category.iconUrl && <Image src={stegaClean(category.iconUrl)} alt="" fill sizes="(max-width: 700px) 74px, 100px" data-sanity={sanityDataAttribute(category._id, "assortmentCategory", "icon")} />}</span>
          <span>{category.title}</span><span className={styles.srOnly}> – zum Abschnitt springen</span>
        </a>
      </li>)}</ul></Container>
    </nav>}
    <div className={styles.directory}>
      <Container>{visibleGroups.map((group) => <section className={styles.group} key={group.key} aria-labelledby={`group-${group.key}`}>
        <Reveal><h2 id={`group-${group.key}`}>{group.title}</h2></Reveal>
        <div className={styles.cards}>{group.categories.map((category, index) => {
          const card: AssortmentCardData = {
            _key: category._id,
            _source: {id: category._id, type: "assortmentCategory", path: "image"},
            title: category.title,
            image: { src: category.imageUrl ?? "", alt: category.imageAlt ?? category.title },
            intro: category.description,
            badgeText: category.badgeText,
            marker: "leaf",
            entries: category.examples?.map((title) => ({ _key: `${category._id}-${title}`, title })) ?? [],
            cta: category.ctaLabel && category.ctaHref ? {label: category.ctaLabel, href: stegaClean(category.ctaHref)} : undefined,
          };
          return <Reveal key={category._id} delay={index * .07}><div id={stegaClean(category.slug)} className={styles.cardAnchor}><AssortmentCard data={card} variant="compact" /></div></Reveal>;
        })}</div>
      </section>)}</Container>
    </div>
  </>;
}
