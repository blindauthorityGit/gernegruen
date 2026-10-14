"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookieNotice.module.css";

const noticeCookie = "gg_cookie_notice";
const noticeLifetime = 60 * 60 * 24 * 180;

function hasDismissedNotice() {
  return document.cookie.split(";").some((cookie) => cookie.trim() === `${noticeCookie}=1`);
}

function saveDismissal() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${noticeCookie}=1; Path=/; Max-Age=${noticeLifetime}; SameSite=Lax${secure}`;
}

export function CookieSettingsButton() {
  return <button className={styles.settingsLink} type="button" onClick={() => window.dispatchEvent(new Event("gg:open-cookie-notice"))}>Cookie-Hinweis</button>;
}

export function CookieNotice() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(!hasDismissedNotice());
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
    saveDismissal();
    setVisible(false);
    setDetails(false);
  };

  if (!ready || !visible) return null;

  return (
    <aside className={styles.notice} aria-label="Hinweis zu Cookies und Datenschutz" aria-live="polite">
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Deine Privatsphäre</p>
          <h2>{details ? "Welche Cookies verwendet diese Website?" : "Ein kurzer Hinweis zu Cookies"}</h2>
          {details ? (
            <div className={styles.details}>
              <div className={styles.item}>
                <strong>Notwendige Speicherung</strong>
                <p>Wir speichern deine Auswahl zu diesem Hinweis in einem eigenen Cookie, damit er nicht bei jedem Besuch erneut erscheint. Es enthält keine Kennung und läuft nach 180 Tagen ab. Das Studio verwendet außerdem ein notwendiges Sitzungscookie ausschließlich für angemeldete Betreiber:innen.</p>
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
            <p>Diese Website verwendet derzeit keine Analyse- oder Werbe-Cookies. Details zur notwendigen Speicherung und zu externen Inhalten findest du im Cookie-Hinweis und in der <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
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
