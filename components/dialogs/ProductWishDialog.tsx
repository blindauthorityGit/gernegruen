"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import { DialogShell, dialogStyles as styles } from "./DialogShell";

type SubmissionStatus = "" | "loading" | "success" | "stored_email_failed" | "error";

export function ProductWishDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<SubmissionStatus>("");
  const [errorMessage, setErrorMessage] = useState("");
  const requestId = useRef("");

  function resetAndClose() {
    setStatus("");
    setErrorMessage("");
    requestId.current = "";
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    setStatus("loading");
    setErrorMessage("");
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/product-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          product: formData.get("product"),
          description: formData.get("description"),
          name: formData.get("name"),
          email: formData.get("email"),
          website: formData.get("website"),
        }),
      });
      const result = await response.json() as { status?: string; message?: string };
      if (result.status === "success") setStatus("success");
      else if (result.status === "stored_email_failed") setStatus("stored_email_failed");
      else {
        setStatus("error");
        setErrorMessage(result.message || "Dein Wunsch konnte gerade nicht übermittelt werden. Bitte versuche es erneut.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Dein Wunsch konnte gerade nicht übermittelt werden. Bitte prüfe deine Verbindung und versuche es erneut.");
    }
  }

  return (
    <DialogShell description="Schlag uns ein Produkt vor, das du gern in unserem Sortiment finden würdest." idPrefix="product-wish-dialog" isOpen={isOpen} onClose={resetAndClose} onSubmit={handleSubmit} title="Produktwunsch mitteilen">
      {status === "success" ? <>
        <p className={styles.status} role="status">Vielen Dank! Dein Produktwunsch ist bei uns eingegangen.</p>
        <div className={styles.actions}><button className={styles.submit} onClick={resetAndClose} type="button">Schließen</button></div>
      </> : <>
      <div className={styles.grid}>
        <label className={styles.full}>Gewünschtes Produkt<input autoFocus disabled={status === "loading"} maxLength={160} name="product" required /></label>
        <label className={styles.full}>Beschreibung <span>(optional)</span><textarea disabled={status === "loading"} maxLength={2000} name="description" rows={3} /></label>
        <label>Name <span>(optional)</span><input autoComplete="name" disabled={status === "loading"} maxLength={100} name="name" /></label>
        <label>E-Mail-Adresse <span>(optional)</span><input autoComplete="email" disabled={status === "loading"} maxLength={254} name="email" type="email" /></label>
        <label aria-hidden="true" className={styles.honeypot}>Website<input autoComplete="off" name="website" tabIndex={-1} /></label>
      </div>
      <p className={styles.notice}><strong>Bitte beachte:</strong> Dein Wunsch ist eine unverbindliche Anregung und keine Bestellung. Wir können nicht garantieren, dass wir das gewünschte Produkt ins Sortiment aufnehmen. Informationen zur Verarbeitung deiner Angaben findest du in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
      {status === "loading" && <p className={styles.status} role="status">Dein Wunsch wird übermittelt …</p>}
      {status === "stored_email_failed" && <p className={styles.status} data-kind="error" role="alert">Dein Wunsch wurde gespeichert. Die E-Mail-Benachrichtigung konnte gerade nicht versendet werden.</p>}
      {status === "error" && <p className={styles.status} data-kind="error" role="alert">{errorMessage}</p>}
      <div className={styles.actions}><button className={styles.submit} disabled={status === "loading" || status === "stored_email_failed"} type="submit">{status === "loading" ? "Wird übermittelt …" : status === "stored_email_failed" ? "Anfrage gespeichert" : "Wunsch übermitteln"}</button></div>
      </>}
    </DialogShell>
  );
}
