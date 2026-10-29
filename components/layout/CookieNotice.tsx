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
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem("gg_cookie_notice_dismissed") === "1";
    } catch {
      // If browser storage is unavailable, keep the informational notice usable for this page view.
    }
    const frame = window.requestAnimationFrame(() => {
      setVisible(!dismissed);
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
    try {
      window.sessionStorage.setItem("gg_cookie_notice_dismissed", "1");
    } catch {
      // Closing the notice still works for this page view if browser storage is unavailable.
    }
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
                <strong>Anmelde-Cookie im Betreiber-Dashboard</strong>
                <p>Dieser Hinweis informiert über eingesetzte Technologien und holt keine Einwilligung ein. Im öffentlichen Website-Bereich setzen wir keine Cookies. Nur das geschützte Betreiber-Dashboard verwendet bei der Anmeldung das notwendige Sitzungscookie <code>gg_studio_session</code> für höchstens 14 Tage. Wenn du diesen Hinweis schließt, merken wir uns das bis zum Ende des aktuellen Browser-Tabs in dessen Sitzungsspeicher.</p>
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
            <p>Im öffentlichen Website-Bereich verwenden wir derzeit keine Cookies, Analyse- oder Werbedienste. Das geschützte Betreiber-Dashboard nutzt bei der Anmeldung ein notwendiges Sitzungscookie. Details und Informationen zu externen Inhalten findest du in diesem Hinweis und in der <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
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
