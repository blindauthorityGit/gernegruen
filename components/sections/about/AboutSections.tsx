import Image from "next/image";
import {Container} from "@/components/layout/Container";
import {Button} from "@/components/ui/Button";
import {Heading} from "@/components/ui/Heading";
import {Reveal} from "@/components/motion/Reveal";
import styles from "./AboutSections.module.css";

export type AboutMilestone = { _key: string; year: string; title: string; description: string; image?: {src: string}; imageAlt?: string };
export type AboutBenefit = { _key: string; title: string; description: string; icon?: {src: string}; iconAlt?: string };

export function AboutTimeline({milestones}: {milestones: AboutMilestone[]}) {
  if (!milestones.length) return null;
  return <section className={styles.timeline} aria-label="Unsere Geschichte">
    <Container>
      <ol aria-label="Stationen unserer Geschichte" className={styles.milestones}>
        {milestones.map((item, index) => <li className={styles.milestone} key={item._key}>
          <Reveal delay={index % 2 ? 0.08 : 0}>
            <span className={styles.year}>{item.year}</span>
            <article className={[styles.milestoneCard, item.image?.src ? "" : styles.milestoneCardTextOnly].filter(Boolean).join(" ")}>
              <div className={styles.milestoneCopy}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              {item.image?.src && <div className={styles.milestoneImage}>
                <Image alt={item.imageAlt || ""} fill sizes="(max-width: 700px) 36vw, 190px" src={item.image.src} />
              </div>}
            </article>
          </Reveal>
        </li>)}
      </ol>
    </Container>
  </section>;
}

export function AboutBenefits({benefits}: {heading?: string; benefits: AboutBenefit[]}) {
  if (!benefits.length) return null;
  return <section className={styles.benefits} aria-label="Was uns ausmacht">
    <Container>
      <ul className={styles.benefitList}>
        {benefits.map((item, index) => <li key={item._key}>
          <Reveal delay={index * 0.06}>
            {item.icon?.src && <Image alt={item.iconAlt || ""} className={styles.benefitIcon} height={180} src={item.icon.src} width={180} sizes="(max-width: 600px) 120px, 180px" />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Reveal>
        </li>)}
      </ul>
    </Container>
  </section>;
}

export function AboutContact({content}: {content: {heading?: string; description?: string; ctaLabel?: string; ctaHref?: string; image?: {src: string}; imageAlt?: string}}) {
  if (!content.heading && !content.description && !content.image?.src) return null;
  return <section className={styles.contact} aria-labelledby={content.heading ? "about-contact-heading" : undefined} aria-label={content.heading ? undefined : "Kontakt"}>
    <div className={styles.contactBackground} aria-hidden="true" />
    <Container className={styles.contactContainer}>
      <Reveal className={styles.contactCopy}>
        {content.heading && <Heading id="about-contact-heading">{content.heading}</Heading>}
        {content.description && <p>{content.description}</p>}
        {content.ctaLabel && content.ctaHref && <Button href={content.ctaHref}>{content.ctaLabel}</Button>}
      </Reveal>
      {content.image?.src && <Reveal className={styles.contactImage}>
        <Image alt={content.imageAlt || ""} fill sizes="(max-width: 700px) 90vw, 45vw" src={content.image.src} />
      </Reveal>}
    </Container>
  </section>;
}
