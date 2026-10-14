import Image from "next/image";
import {ContactMap} from "./ContactMap";
import {Container} from "@/components/layout/Container";
import {Button} from "@/components/ui/Button";
import {Reveal} from "@/components/motion/Reveal";
import {formatOpeningHours, getBerlinDateKey, getOpeningHoursForDate} from "@/lib/content/openingHours";
import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./ContactSections.module.css";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";

type TravelBenefit = {title: string; description: string; icon?: string; iconAlt?: string};

function CardIcon({kind}: {kind: "clock" | "pin" | "phone" | "mail" | "instagram"}) {
  const paths = {
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    phone: <path d="M6.5 3.5 9 3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L16 13l5 2-.5 2.5c-.3 1.2-1.3 2-2.5 2C10 19.5 4.5 14 4.5 6c0-1.2.8-2.2 2-2.5Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>;
}

export function ContactCards({business, cards}: {business: BusinessSettings; cards?: {openingHoursHeading?: string; contactHeading?: string};}) {
  if (!business) return null;
  const route = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${business.coordinates.latitude}%2C${business.coordinates.longitude}`;
  const instagram = business.instagramHandle ? stegaClean(business.instagramHandle).replace(/^@/, "") : undefined;
  const today = getOpeningHoursForDate(business.openingHours, business.exceptions ?? [], getBerlinDateKey());
  const phoneHref = `tel:${stegaClean(business.phone).replace(/[^\d+]/g, "")}`;

  return <section className={styles.cardsSection} aria-label="Öffnungszeiten und Kontakt">
    <Container className={styles.cardsGrid}>
      <Reveal className={styles.reveal}>
        <article className={styles.infoCard}>
          {cards?.openingHoursHeading && <h2><CardIcon kind="clock"/>{cards.openingHoursHeading}</h2>}
          {today?.label && <p className={styles.exceptionLabel}>{today.label}</p>}
          <ul className={styles.hoursList}>
            {business.openingHours.map((day) => {
              const todayOverride = day.dayOfWeek === today?.dayOfWeek ? today : day;
              return <li key={day.dayOfWeek}>
                <span data-sanity={day._key ? sanityDataAttribute("businessSettings", "businessSettings", `openingHours[_key=="${day._key}"].day`) : undefined}>{day.day}</span><span data-sanity={day._key ? sanityDataAttribute("businessSettings", "businessSettings", `openingHours[_key=="${day._key}"]`) : undefined}>{formatOpeningHours(todayOverride)}</span>
              </li>;
            })}
          </ul>
          {(business.exceptions ?? []).filter((item) => stegaClean(item.date) >= getBerlinDateKey()).length > 0 && <div className={styles.specialHours}>
            <h3>Sonderöffnungszeiten</h3>
            <ul>{business.exceptions?.filter((item) => stegaClean(item.date) >= getBerlinDateKey()).map((item) => <li key={item.date}><span data-sanity={item._key ? sanityDataAttribute("businessSettings", "businessSettings", `exceptions[_key=="${item._key}"].label`) : undefined}>{item.label || new Intl.DateTimeFormat("de-DE", {dateStyle: "medium", timeZone: "Europe/Berlin"}).format(new Date(`${stegaClean(item.date)}T12:00:00Z`))}</span><span data-sanity={item._key ? sanityDataAttribute("businessSettings", "businessSettings", `exceptions[_key=="${item._key}"]`) : undefined}>{item.isClosed ? "geschlossen" : item.opens && item.closes ? `${item.opens}–${item.closes} Uhr` : "Öffnungszeiten siehe Laden"}</span></li>)}</ul>
          </div>}
        </article>
      </Reveal>
      <Reveal className={styles.reveal} delay={0.08}>
        <article className={`${styles.infoCard} ${styles.contactCard}`}>
          {cards?.contactHeading && <h2><CardIcon kind="pin"/>{cards.contactHeading}</h2>}
          <p className={styles.businessName} data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "businessName")}>{business.businessName}</p>
          <address><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "street")}>{business.street}</span><br/><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "postalCode")}>{business.postalCode}</span> <span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "city")}>{business.city}</span></address>
          <ul className={styles.contactList}>
            <li><CardIcon kind="phone"/><a href={phoneHref} data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "phone")}>{business.phone}</a></li>
            <li><CardIcon kind="mail"/><a href={`mailto:${stegaClean(business.email)}`} data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "email")}>{business.email}</a></li>
            {instagram && <li><CardIcon kind="instagram"/><a href={`https://www.instagram.com/${instagram}/`} rel="noreferrer" target="_blank" data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "instagramHandle")}>{instagram}</a></li>}
          </ul>
          <Button className={styles.routeLink} href={route} rel="noreferrer" target="_blank" variant="outline"><CardIcon kind="pin"/>Adresse in OpenStreetMap</Button>
        </article>
      </Reveal>
    </Container>
  </section>;
}

export function DirectionsSection({business, directions, benefits}: {business: BusinessSettings; directions?: {heading?: string; description?: string; mapZoom?: number; routeLabel?: string}; benefits: TravelBenefit[]}) {
  if (!business) return null;
  const route = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${business.coordinates.latitude}%2C${business.coordinates.longitude}`;
  const directionsBenefits = benefits.filter((benefit) => {
    const title = benefit.title.toLocaleLowerCase("de-DE").normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return title.includes("fahrrad") || title.includes("parkplatz");
  });
  return <section className={styles.directionsSection} aria-labelledby="contact-directions-heading">
    <Container>
      <div className={styles.directionsIntro}>
        {directions?.heading && <h2 id="contact-directions-heading">{directions.heading}</h2>}
        {directions?.description && <p>{directions.description}</p>}
      </div>
      <div className={styles.directionsGrid}>
        <div className={styles.travelInfo}>
          <ul className={styles.travelBenefits}>
            {directionsBenefits.map((benefit, index) => <li key={benefit.title}>
              <Reveal className={styles.benefitReveal} delay={index * 0.1}>
                {benefit.icon && <Image alt={benefit.iconAlt || ""} src={benefit.icon} width={92} height={92} />}
                <div><h3>{benefit.title}</h3><p>{benefit.description}</p></div>
              </Reveal>
            </li>)}
          </ul>
        </div>
        <Reveal className={styles.mapReveal} delay={0.12}>
          <div className={styles.mapColumn}>
            <ContactMap business={business} zoom={directions?.mapZoom ?? 17}/>
            {directions?.routeLabel && <Button className={styles.routeButton} href={route} rel="noreferrer" target="_blank">{directions.routeLabel}<span aria-hidden="true">↗</span></Button>}
            <p className={styles.routeNote}>Öffnet OpenStreetMap mit GerneGrün als Ziel.</p>
          </div>
        </Reveal>
      </div>
    </Container>
  </section>;
}
