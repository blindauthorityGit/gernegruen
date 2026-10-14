"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "./Container";
import {useGlobalDialogs} from "@/components/dialogs/GlobalDialogProvider";
import {OpeningHoursStrip} from "./OpeningHoursStrip";
import {getBerlinDateKey} from "@/lib/content/openingHours";
import type {BusinessSettings} from "@/sanity/types/business";
import styles from "./Header.module.css";
import {sanityDataAttribute} from "@/sanity/lib/dataAttribute";
import {stegaClean} from "next-sanity";

export type HeaderNavigationItem = {
  href: string;
  label: string;
};

type HeaderProps = {
  activeHref?: string;
  navigationItems?: readonly HeaderNavigationItem[];
  business?: BusinessSettings;
};

export const defaultHeaderNavigation: readonly HeaderNavigationItem[] = [
  { href: "/diese-woche", label: "Diese Woche" },
  { href: "/sortiment", label: "Sortiment" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt & Anfahrt" },
];

function NavigationList({
  activeHref,
  items,
  onNavigate,
}: {
  activeHref?: string;
  items: readonly HeaderNavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className={styles.navigationList}>
      {items.map((item) => {
        const isActive = item.href === activeHref;

        return (
          <li key={item.href}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={styles.navigationLink}
              data-active={isActive || undefined}
              href={item.href}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Header({
  activeHref,
  navigationItems = defaultHeaderNavigation,
  business,
}: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const {openDialog} = useGlobalDialogs();
  const resolvedActiveHref = activeHref ?? pathname;

  useEffect(() => {
    const updateStickyState = () => setIsSticky(window.scrollY > 160);
    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyState);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header} data-menu-open={isMobileMenuOpen || undefined}>
      {business?.openingHours?.length === 7 && <OpeningHoursStrip exceptions={business.exceptions ?? []} initialDateKey={getBerlinDateKey()} openingHours={business.openingHours} />}
      <div className={styles.navigationRow} data-sticky={isSticky || undefined}>
      <Container className={styles.container}>
        <Link aria-label="GerneGrün Startseite" className={styles.logoLink} href="/">
          <Image
            alt=""
            height={92}
            priority
            src="/graphics/gernegruen-logo-subline-dark-green.png"
            width={255}
          />
        </Link>

        <nav aria-label="Hauptnavigation" className={styles.desktopNavigation}>
          <NavigationList activeHref={resolvedActiveHref} items={navigationItems} />
        </nav>

        <button className={styles.orderButton} onClick={() => openDialog("preorder")} type="button">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 7h15l-1.1 9.3a1.4 1.4 0 0 1-1.4 1.2H5A1.4 1.4 0 0 1 3.6 16L2.5 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m6.3 7 3.7-4 3.7 4M7.5 10.2v4.2m5-4.2v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Backwaren vorbestellen</span>
        </button>

        <div className={styles.mobileNavigation} data-open={isMobileMenuOpen || undefined}>
          <button
            aria-controls="mobile-navigation-panel"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Hauptnavigation schließen" : "Hauptnavigation öffnen"}
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            type="button"
          >
            <span className={styles.menuIcon} data-open={isMobileMenuOpen || undefined} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
          {isMobileMenuOpen && (
            createPortal(
              <>
              <button aria-label="Menü schließen" className={styles.menuBackdrop} onClick={() => setIsMobileMenuOpen(false)} type="button" />
              <nav aria-label="Mobile Hauptnavigation" className={styles.mobileMenuPanel} id="mobile-navigation-panel">
                <div className={styles.menuPanelHeader}>
                  <span className={styles.menuEyebrow}>Schön, dass du da bist</span>
                  <button aria-label="Menü schließen" className={styles.closeButton} onClick={() => setIsMobileMenuOpen(false)} type="button">
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <NavigationList activeHref={resolvedActiveHref} items={navigationItems} onNavigate={() => setIsMobileMenuOpen(false)} />
                <div className={styles.menuPanelFooter}>
                  {business && (
                    <div className={styles.menuContact}>
                      <a className={styles.menuContactLink} href={`tel:${stegaClean(business.phone).replace(/[^\d+]/g, "")}`}>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6.5 3.5 9 3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L16 13l5 2-.5 2.5c-.3 1.2-1.3 2-2.5 2C10 19.5 4.5 14 4.5 6c0-1.2.8-2.2 2-2.5Z" />
                        </svg>
                        <span><small>Ruf uns an</small><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "phone")}>{business.phone}</span></span>
                      </a>
                      <a
                        aria-label={`Route zu ${stegaClean(business.businessName)}, ${stegaClean(business.street)}, ${stegaClean(business.postalCode)} ${stegaClean(business.city)} öffnen`}
                        className={styles.menuContactLink}
                        href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${business.coordinates.latitude}%2C${business.coordinates.longitude}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        <span><small>Hier findest du uns</small><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "street")}>{business.street}</span><br /><span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "postalCode")}>{business.postalCode}</span> <span data-sanity={sanityDataAttribute("businessSettings", "businessSettings", "city")}>{business.city}</span></span>
                      </a>
                    </div>
                  )}
                  <button className={styles.mobileOrderButton} onClick={() => { setIsMobileMenuOpen(false); openDialog("preorder"); }} type="button">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 7h15l-1.1 9.3a1.4 1.4 0 0 1-1.4 1.2H5A1.4 1.4 0 0 1 3.6 16L2.5 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m6.3 7 3.7-4 3.7 4M7.5 10.2v4.2m5-4.2v4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Backwaren vorbestellen</span>
                  </button>
                  <span className={styles.menuFooterNote}>Frische Auswahl. Persönlich für dich da.</span>
                </div>
              </nav>
              </>,
              document.body,
            )
          )}
        </div>
      </Container>
      </div>
      {isSticky && <div aria-hidden="true" className={styles.stickySpacer} />}
    </header>
  );
}
