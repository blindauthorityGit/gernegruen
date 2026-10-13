"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import styles from "./ContentCard.module.css";

export type ContentCardData = {
  id: string;
  image: {
    src: string;
    alt: string;
  };
  category: {
    title: string;
    shortLabel?: string;
    styleVariant: "green" | "orange" | "lime" | "lightGreen";
  };
  title: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
};

export function ContentCard({ data }: { data: ContentCardData }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={styles.card}
      data-category-variant={data.category.styleVariant}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.imageArea}>
        <motion.div
          className={styles.imageWrap}
          whileHover={reduceMotion ? undefined : { scale: 1.025 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            alt={data.image.alt}
            fill
            sizes="(max-width: 767px) 82vw, 257px"
            src={data.image.src}
          />
        </motion.div>

        <span className={styles.badge}>
          {data.category.shortLabel ?? data.category.title}
        </span>
      </div>

      <p className={styles.category}>{data.category.title}</p>
      <h3 className={styles.title}>{data.title}</h3>
      <p className={styles.description}>{data.description}</p>

      <Link className={styles.link} href={data.cta.href}>
        <span>{data.cta.label}</span>
        <Image aria-hidden="true" alt="" height={11} src="/icons/arrow-right.svg" width={11} />
      </Link>
    </motion.article>
  );
}
