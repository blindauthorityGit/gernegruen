"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ContentCard, type ContentCardData } from "@/components/ui/ContentCard";
import { Heading } from "@/components/ui/Heading";

import styles from "./ContentCardSection.module.css";

export type ContentCardSectionData = {
  heading: string;
  intro: string;
  cta?: {
    label: string;
    href: string;
  };
  items: ContentCardData[];
};

const ease = [0.22, 1, 0.36, 1] as const;

export function ContentCardSection({ data }: { data: ContentCardSectionData }) {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.6, ease },
      };

  return (
    <section className={styles.section} aria-labelledby="current-content-heading">
      <Container className={styles.container}>
        <motion.div className={styles.intro} {...reveal}>
          <Heading className={styles.heading} id="current-content-heading">
            {data.heading}
          </Heading>
          <p className={styles.lead}>{data.intro}</p>
          <motion.div
            className={styles.decoration}
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, scaleX: 0.82 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.55, delay: 0.12, ease }}
          >
            <Image
              alt=""
              height={43}
              src="/graphics/content-section-leaf-line.png"
              width={200}
            />
          </motion.div>
          {data.cta ? (
            <Button className={styles.sectionLink} href={data.cta.href} variant="text">
              <span>{data.cta.label}</span>
              <Image aria-hidden="true" alt="" height={11} src="/icons/arrow-right.svg" width={11} />
            </Button>
          ) : null}
        </motion.div>

        <motion.div
          className={styles.sliderWrap}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.12, ease }}
        >
          <Swiper
            a11y={{ enabled: true }}
            breakpoints={{
              0: { slidesPerView: "auto", spaceBetween: 16 },
              768: { slidesPerView: 2.25, spaceBetween: 22 },
              1024: { slidesPerView: 3, spaceBetween: 22 },
            }}
            className={styles.slider}
            keyboard={{ enabled: true }}
            modules={[A11y, Keyboard]}
            resistanceRatio={0.65}
            watchOverflow
          >
            {data.items.map((item) => (
              <SwiperSlide className={styles.slide} key={item.id}>
                <ContentCard data={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </Container>
    </section>
  );
}
