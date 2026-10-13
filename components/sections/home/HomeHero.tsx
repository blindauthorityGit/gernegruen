import styles from "./HomeHero.module.css";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export type HomeHeroData = {
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: { src: string; alt: string };
};

export function HomeHero({ data }: { data: HomeHeroData }) {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.backgroundShape} aria-hidden="true" />
      <Container className={styles.container}>
        <div className={styles.copy}>
          <h1 className={styles.heading} id="home-hero-heading">
            <span className={styles.headlinePrimary}>
              {data.headlineLine1}
              <span className={styles.accent} aria-hidden="true">
                <Image alt="" fill sizes="64px" src="/graphics/home-hero-accent-transparent.png" />
              </span>
            </span>
            <span className={styles.headlineSecondary}>{data.headlineLine2}</span>
          </h1>
          <p className={styles.teaser}>{data.description}</p>
          <div className={styles.actions}>
            <Button className={styles.primaryCta} href={data.primaryCta.href}>{data.primaryCta.label}</Button>
            <Button className={styles.secondaryCta} href={data.secondaryCta.href} variant="outline">{data.secondaryCta.label}</Button>
          </div>
        </div>
        <div className={styles.imageStage}>
          <Image alt={data.image.alt} fill priority sizes="(max-width: 767px) 94vw, (max-width: 1100px) 90vw, 1128px" src={data.image.src} unoptimized={data.image.src.startsWith("https://cdn.sanity.io/")} />
        </div>
      </Container>
    </section>
  );
}
