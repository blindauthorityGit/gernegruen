"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookieNotice.module.css";

export function CookieSettingsButton() {
  return <button className={styles.settingsLink} type="button" onClick={() => window.dispatchEvent(new Event("gg:open-cookie-notice"))}>Cookie-Hinweis</button>;
}

export function CookieNotice() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
      setReady(true);
    });
    const open = () => {
      setDetails(true);
      setVisible(true);
    };
    window.addEventListener("gg:open-cookie-notice", open);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("gg:open-cookie-notice", open);
    };
  }, []);

  const close = () => {
    setVisible(false);
    setDetails(false);
  };

  if (!ready || !visible) return null;

  return (
    <aside className={styles.notice} aria-label="Hinweis zu Cookies und Datenschutz" aria-live="polite">
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Deine Privatsphäre</p>
          <h2>{details ? "Cookies und externe Inhalte" : "Ein kurzer Hinweis zu Cookies"}</h2>
          {details ? (
            <div className={styles.details}>
              <div className={styles.item}>
                <strong>Anmeldung im Betreiberbereich</strong>
                <p>Öffentlich verwenden wir keine Cookies. Nur für die Anmeldung im Betreiber-Dashboard ist ein notwendiges Cookie im Einsatz. Es läuft nach spätestens 14 Tagen ab.</p>
              </div>
              <div className={styles.item}>
                <strong>Statistik und Marketing</strong>
                <p>Wir setzen derzeit keine Analyse- oder Werbedienste ein.</p>
              </div>
              <div className={styles.item}>
                <strong>Karten und externe Inhalte</strong>
                <p>Externe Inhalte werden nicht automatisch eingebettet. OpenStreetMap öffnet sich erst, wenn du einen Karten- oder Routenlink anklickst.</p>
              </div>
              <p className={styles.privacyLink}><Link href="/datenschutz">Alle Informationen in der Datenschutzerklärung</Link></p>
            </div>
          ) : (
                <p>Öffentlich nutzen wir keine Cookies, Analyse- oder Werbedienste. Nur das Betreiber-Dashboard nutzt zur Anmeldung ein notwendiges Cookie. Details stehen in diesem Hinweis und in der <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
          )}
        </div>
        <div className={styles.actions}>
          {!details && <button className={styles.secondaryButton} type="button" onClick={() => setDetails(true)}>Details ansehen</button>}
          <button className={styles.primaryButton} type="button" onClick={close}>{details ? "Schließen" : "Hinweis schließen"}</button>
        </div>
      </div>
    </aside>
  );
}
