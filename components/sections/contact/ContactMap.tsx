import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./ContactSections.module.css";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";

export function ContactMap({business, zoom}: {business: NonNullable<BusinessSettings>; zoom: number}) {
  const {latitude, longitude} = business.coordinates;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

  return <div className={styles.mapFrame}>
    <a className={styles.mapCanvas} href={mapUrl} rel="noreferrer" target="_blank" aria-label={`OpenStreetMap öffnen: ${stegaClean(business.businessName)}, ${stegaClean(business.street)}, ${stegaClean(business.postalCode)} ${stegaClean(business.city)} (neuer Tab)`}>
      <svg aria-hidden="true" viewBox="0 0 48 56" fill="none"><path d="M24 54S5 34.1 5 21a19 19 0 1 1 38 0c0 13.1-19 33-19 33Z" fill="currentColor"/><circle cx="24" cy="21" r="7" fill="#d7e8b2" stroke="white" strokeWidth="2"/></svg>
      <span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "businessName")}>{business.businessName}</span>
      <span><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "street")}>{business.street}</span><br /><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "postalCode")}>{business.postalCode}</span> <span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "city")}>{business.city}</span></span>
      <strong>OpenStreetMap öffnen <span aria-hidden="true">↗</span></strong>
      <small>Die Karte wird erst nach dem Klick bei OpenStreetMap geladen.</small>
    </a>
  </div>;
}
