import Image from "next/image";
import {Container} from "@/components/layout/Container";
import {Button} from "@/components/ui/Button";
import {Reveal} from "@/components/motion/Reveal";
import {AssortmentCard, type AssortmentCardData} from "@/components/ui/AssortmentCard";
import styles from "./AssortmentSection.module.css";

export type AssortmentSectionData = {
  id: string;
  _type?: "assortmentEdition";
  topline?: string;
  heading: string;
  description?: string;
  callout?: string;
  cta?: {label: string; href: string};
  cards: AssortmentCardData[];
};

export function AssortmentSection({data}: {data: AssortmentSectionData}) {
  return <section className={styles.section} id="diese-woche" aria-labelledby="assortment-heading">
    <div className={styles.background} aria-hidden="true" />
    <Container>
      <div className={styles.content}>
        <div className={styles.header}>
          <Reveal>
            {data.topline && <p className={styles.topline}>{data.topline}</p>}
            <h2 className={styles.heading} id="assortment-heading">{data.heading}</h2>
            {data.description && <p className={styles.description}>{data.description}</p>}
            {data.cta && <Button className={styles.link} href={data.cta.href} variant="text">{data.cta.label}<Image alt="" width={11} height={11} src="/icons/arrow-right.svg" /></Button>}
          </Reveal>
          {data.callout && <Reveal className={styles.callout} delay={0.12}><span>{data.callout}</span></Reveal>}
        </div>
        <div className={styles.cards}>
          {data.cards.map((card, i) => <Reveal key={card._key} delay={Math.min(i, 2) * 0.09}><AssortmentCard data={{...card, _source: {id: data.id, type: "assortmentEdition", path: `cards[_key=="${card._key}"].image`}}} /></Reveal>)}
        </div>
      </div>
    </Container>
  </section>;
}
