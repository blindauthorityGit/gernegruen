"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { useGlobalDialogs } from "@/components/dialogs/GlobalDialogProvider";
import { Container } from "@/components/layout/Container";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";

import styles from "./Callouts.module.css";

export type ProductWishContent = {isVisible?: boolean; eyebrow?: string; heading?: string; description?: string; disclaimer?: string; buttonLabel?: string; imageSrc?: string; imageAlt?: string};

export function ProductWishCTA({content, sourceId}: {content?: ProductWishContent; sourceId?: string}) {
  const { openDialog } = useGlobalDialogs();
  const field = (name: string) => sourceId ? sanityDataAttribute(sourceId, "assortmentPage", `productWish.${name}`) : undefined;
  const imageSource = content?.imageSrc ? stegaClean(content.imageSrc) : "/graphics/product-wish-box.png";

  return (
    <section className={styles.wishSection} aria-labelledby="product-wish-title">
      <Container className={styles.wish}>
        <div>
          <p className={styles.eyebrow} data-sanity={field("eyebrow")}>{content?.eyebrow || "Deine Idee für unser Regal"}</p>
          <Heading id="product-wish-title" data-sanity={field("heading")}>{content?.heading || "Du vermisst etwas in unserem Sortiment?"}</Heading>
          <p data-sanity={field("description")}>{content?.description || "Gibt es ein Produkt, das du gerne bei uns finden würdest? Teile uns deinen Wunsch mit! Wir freuen uns über deine Anregungen und prüfen gerne, ob wir es künftig in unser Sortiment aufnehmen können."}</p>
          <p className={styles.disclaimer} data-sanity={field("disclaimer")}>{content?.disclaimer || "Ein Produktwunsch ist eine unverbindliche Anregung – keine Bestellung oder Reservierung."}</p>
        </div>
        <div className={styles.wishAside}>
          <Image alt={content?.imageAlt || "Fragezeichen über einem Einkaufskarton"} className={styles.wishImage} data-sanity={field("image")} height={280} src={imageSource} width={280} />
          <Button data-sanity={field("buttonLabel")} onClick={() => openDialog("productWish")}>{content?.buttonLabel || "Produktwunsch mitteilen"}</Button>
        </div>
      </Container>
    </section>
  );
}
