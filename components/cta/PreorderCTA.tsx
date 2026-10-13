"use client";

import { Button } from "@/components/ui/Button";
import { useGlobalDialogs } from "@/components/dialogs/GlobalDialogProvider";
import { Heading } from "@/components/ui/Heading";

import styles from "./Callouts.module.css";

type PreorderCTAProps = {
  heading?: string;
  text?: string;
};

export function PreorderCTA({heading, text}: PreorderCTAProps) {
  const { openDialog } = useGlobalDialogs();

  return (
    <aside className={styles.preorder} id="backwaren-vorbestellen" aria-labelledby="preorder-title">
      <div>
        <p className={styles.eyebrow}>Einfach für dich zurückgelegt</p>
        <Heading id="preorder-title">{heading || "Deine Lieblingsbackwaren vorbestellen"}</Heading>
        <p>{text || "Du möchtest sichergehen, dass dein Lieblingsbrot oder Kuchen für dich bereitliegt? Bestelle deine Backwaren ganz einfach vor und hole sie bei uns im Laden ab."}</p>
      </div>
      <div className={styles.actions}>
        <Button onClick={() => openDialog("preorder")}>Backwaren vorbestellen</Button>
        <a href="tel:+4961033867347"><span>Oder telefonisch:</span> 06103-3867347</a>
      </div>
    </aside>
  );
}
