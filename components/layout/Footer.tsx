import Link from "next/link";

import { Container } from "./Container";
import { FooterBleedSync } from "./FooterBleedSync";
import { formatOpeningHours, getBerlinDateKey } from "@/lib/content/openingHours";
import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./Footer.module.css";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";
import type {FooterSettings} from "@/sanity/lib/footerSettings";
import {CookieSettingsButton} from "./CookieNotice";

function Icon({ type }: { type: "clock" | "pin" | "instagram" }) {
  if (type === "clock") return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><circle cx="15" cy="16" r="11" stroke="currentColor" strokeWidth="2.5" /><path d="M15 9v7l5 3M25 5l2 3-3 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === "pin") return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M16 29s10-9.1 10-17a10 10 0 1 0-20 0c0 7.9 10 17 10 17Z" fill="currentColor" /><circle cx="16" cy="12" r="3.5" fill="#494260" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.8" r="1.2" fill="currentColor" /></svg>;
}

function FooterHeading({ icon, children, dataSanity }: { icon: "clock" | "pin"; children: string; dataSanity?: string }) {
  return <h2 className={styles.heading} data-sanity={dataSanity}><span className={styles.headingIcon}><Icon type={icon} /></span>{children}</h2>;
}

const defaultLegalLinks: NonNullable<NonNullable<FooterSettings>["legalLinks"]> = [
  {label: "Impressum", href: "/impressum"},
  {label: "Datenschutzerklärung", href: "/datenschutz"},
  {label: "Barrierefreiheit", href: "/barrierefreiheit"},
];

export function Footer({business, settings}: {business: BusinessSettings; settings: FooterSettings}) {
  const coordinates = business?.coordinates;
  const directionsHref = coordinates ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${coordinates.latitude}%2C${coordinates.longitude}` : undefined;
  const legalLinks: NonNullable<NonNullable<FooterSettings>["legalLinks"]> = settings?.legalLinks?.length ? settings.legalLinks : defaultLegalLinks;
  return (
    <footer className={styles.footer} data-site-footer>
      <FooterBleedSync />
      <Container className={styles.content}>
        <section className={styles.column}>
          <FooterHeading icon="clock" dataSanity={sanityDataAttribute("footerSettings", "footerSettings", "openingHoursHeading")}>{settings?.openingHoursHeading || "Öffnungszeiten"}</FooterHeading>
          <ul className={styles.hours}>
            {(business?.openingHours ?? []).map((entry) => (
              <li key={entry.day}><span data-sanity={entry._key ? sanityDataAttribute("businessSettings", "businessSettings", `openingHours[_key=="${entry._key}"].day`) : undefined}>{entry.day}</span><span data-sanity={entry._key ? sanityDataAttribute("businessSettings", "businessSettings", `openingHours[_key=="${entry._key}"]`) : undefined}>{formatOpeningHours(entry)}</span></li>
            ))}
            {(business?.exceptions ?? []).filter((entry) => stegaClean(entry.date) >= getBerlinDateKey()).map((entry) => (
              <li key={entry.date}><span data-sanity={entry._key ? sanityDataAttribute("businessSettings", "businessSettings", `exceptions[_key=="${entry._key}"].label`) : undefined}>{entry.label || new Intl.DateTimeFormat("de-DE", {dateStyle: "medium", timeZone: "Europe/Berlin"}).format(new Date(`${stegaClean(entry.date)}T12:00:00Z`))}</span><span data-sanity={entry._key ? sanityDataAttribute("businessSettings", "businessSettings", `exceptions[_key=="${entry._key}"]`) : undefined}>{entry.isClosed ? "geschlossen" : entry.opens && entry.closes ? `${entry.opens} - ${entry.closes} Uhr` : "Öffnungszeiten siehe Laden"}</span></li>
            ))}
          </ul>
        </section>
        <section className={styles.column}>
          <FooterHeading icon="pin" dataSanity={sanityDataAttribute("footerSettings", "footerSettings", "addressHeading")}>{settings?.addressHeading || "Besuche uns"}</FooterHeading>
          {business && <address className={styles.address}>
            {directionsHref && <a href={directionsHref} rel="noreferrer" target="_blank"><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "businessName")}>{business.businessName}</span><br /><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "street")}>{business.street}</span><br /><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "postalCode")}>{business.postalCode}</span> <span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "city")}>{business.city}</span></a>}
            <a href={`tel:${stegaClean(business.phone).replace(/[^\d+]/g, "")}`} data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "phone")}>{business.phone}</a>
            <a href={`mailto:${stegaClean(business.email)}`} data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "email")}>{business.email}</a>
          </address>}
          {business?.instagramHandle && <a className={styles.instagram} href={`https://www.instagram.com/${stegaClean(business.instagramHandle).replace(/^@/, "")}/`} rel="noreferrer" target="_blank">
            <span className={styles.socialIcon}><Icon type="instagram" /></span><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "instagramHandle")}>{business.instagramHandle.replace(/^@/, "")}</span>
          </a>}
        </section>
        <nav className={styles.column} aria-label="Rechtliche Informationen">
          <FooterHeading icon="pin" dataSanity={sanityDataAttribute("footerSettings", "footerSettings", "linksHeading")}>{settings?.linksHeading || "Links"}</FooterHeading>
          <ul className={styles.links}>
            {legalLinks.map((item) => {
              const href = stegaClean(item.href);
              const dataPath = item._key ? `legalLinks[_key=="${item._key}"]` : undefined;
              return <li key={item._key ?? href} data-sanity={dataPath ? sanityDataAttribute("footerSettings", "footerSettings", dataPath) : undefined}>
                {href.startsWith("https://")
                  ? <a href={href} rel="noreferrer" target="_blank"><span data-sanity={dataPath ? sanityDataAttribute("footerSettings", "footerSettings", `${dataPath}.label`) : undefined}>{item.label}</span></a>
                  : <Link href={href}><span data-sanity={dataPath ? sanityDataAttribute("footerSettings", "footerSettings", `${dataPath}.label`) : undefined}>{item.label}</span></Link>}
              </li>;
            })}
          </ul>
          <div className={styles.cookieSettings}><CookieSettingsButton /></div>
        </nav>
      </Container>
    </footer>
  );
}
