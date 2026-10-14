"use client";

import { Button } from "@/components/ui/Button";
import { useGlobalDialogs } from "@/components/dialogs/GlobalDialogProvider";
import { Heading } from "@/components/ui/Heading";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";

import styles from "./Callouts.module.css";

type PreorderCTAProps = {
  eyebrow?: string;
  heading?: string;
  text?: string;
  buttonLabel?: string;
};

export function PreorderCTA({eyebrow, heading, text, buttonLabel}: PreorderCTAProps) {
  const { openDialog } = useGlobalDialogs();

  return (
    <aside className={styles.preorder} id="backwaren-vorbestellen" aria-labelledby="preorder-title">
      <div>
        <p className={styles.eyebrow} data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "preorderEyebrow")}>{eyebrow || "Einfach für dich zurückgelegt"}</p>
        <Heading id="preorder-title" data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "preorderHeading")}>{heading || "Deine Lieblingsbackwaren vorbestellen"}</Heading>
        <p data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "preorderDescription")}>{text || "Du möchtest sichergehen, dass dein Lieblingsbrot oder Kuchen für dich bereitliegt? Bestelle deine Backwaren ganz einfach vor und hole sie bei uns im Laden ab."}</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={() => openDialog("preorder")} data-sanity={sanityDataAttribute("weeklyPageSettings", "weeklyPageSettings", "preorderButtonLabel")}>{buttonLabel || "Backwaren vorbestellen"}</Button>
        <a href="tel:+4961033867347"><span>Oder telefonisch:</span> 06103-3867347</a>
      </div>
    </aside>
  );
}
