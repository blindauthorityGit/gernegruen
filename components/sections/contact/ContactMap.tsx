import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./ContactSections.module.css";

export function ContactMap({business, zoom}: {business: NonNullable<BusinessSettings>; zoom: number}) {
  const {latitude, longitude} = business.coordinates;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

  return <div className={styles.mapFrame}>
    <a className={styles.mapCanvas} href={mapUrl} rel="noreferrer" target="_blank" aria-label={`OpenStreetMap öffnen: ${business.businessName}, ${business.street}, ${business.postalCode} ${business.city} (neuer Tab)`}>
      <svg aria-hidden="true" viewBox="0 0 48 56" fill="none"><path d="M24 54S5 34.1 5 21a19 19 0 1 1 38 0c0 13.1-19 33-19 33Z" fill="currentColor"/><circle cx="24" cy="21" r="7" fill="#d7e8b2" stroke="white" strokeWidth="2"/></svg>
      <span>{business.businessName}</span>
      <span>{business.street}<br />{business.postalCode} {business.city}</span>
      <strong>OpenStreetMap öffnen <span aria-hidden="true">↗</span></strong>
      <small>Die Karte wird erst nach dem Klick bei OpenStreetMap geladen.</small>
    </a>
  </div>;
}
