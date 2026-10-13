"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { Container } from "./Container";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  aside?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  illustration?: { src: string; alt: string };
  photo?: { src: string; alt: string };
  accentTitle?: string;
  showAccent?: boolean;
  mobileAccentPosition?: "default" | "closer" | "farther";
  centerBadgeVertically?: boolean;
  variant?: "default" | "botanical" | "editorial";
  compact?: boolean;
};

export function PageHero({
  title,
  description,
  eyebrow,
  aside,
  badge,
  children,
  illustration,
  photo,
  accentTitle,
  showAccent = false,
  mobileAccentPosition = "default",
  centerBadgeVertically = false,
  variant = "default",
  compact = false,
}: PageHeroProps) {
  // Motion's reduced-motion hook may be unresolved on the server and already
  // resolved in the browser. Keep the server and first client render identical.
  const reducedMotion = useReducedMotion();
  const easing = [0.16, 1, 0.3, 1] as const;
  const reveal = (delay: number) => ({
    initial: false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, delay: reducedMotion ? 0 : delay, ease: easing },
  });

  return (
    <section className={styles.hero} data-variant={variant} data-mobile-accent={mobileAccentPosition} data-compact={compact || undefined} data-center-badge={centerBadgeVertically || undefined} aria-labelledby="page-title">
      <Container className={styles.container}>
        <div className={styles.copy}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <div className={styles.titleGroup}>
            <motion.h1 className={styles.title} id="page-title" {...reveal(0)}>
              {title}{accentTitle && <><br /><span className={styles.titleAccent}>{accentTitle}</span></>}
            </motion.h1>
            {showAccent && (
              <motion.span
                aria-hidden="true"
                className={styles.accent}
                initial={false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: reducedMotion ? 0 : 0.12, ease: easing }}
              >
                <Image alt="" fill sizes="64px" src="/graphics/home-hero-accent-transparent.png" />
              </motion.span>
            )}
          </div>
          <motion.p className={styles.description} {...reveal(0.18)}>{description}</motion.p>
          {children && <motion.div className={styles.childContent} {...reveal(0.27)}>{children}</motion.div>}
        </div>
        {(illustration || aside || badge) && (
          <div className={styles.visual}>
            {illustration && (
              <motion.div
                className={styles.illustrationMotion}
                initial={false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.1, delay: reducedMotion ? 0 : 0.32, ease: easing }}
              >
                <Image alt={illustration.alt} className={styles.illustration} fill priority sizes="(max-width: 700px) 96vw, 530px" src={illustration.src} />
              </motion.div>
            )}
            {aside && <div className={styles.aside}>{aside}</div>}
            {badge && <motion.div className={styles.badge} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: reducedMotion ? 0 : 0.3, ease: easing }}>{badge}</motion.div>}
          </div>
        )}
        {photo && (
          <motion.div className={styles.editorialPhoto} initial={false} animate={{opacity: 1, y: 0}} transition={{duration: 0.9, delay: reducedMotion ? 0 : 0.28, ease: easing}}>
            <Image alt={photo.alt} fill priority sizes="(max-width: 700px) 92vw, (max-width: 1100px) 48vw, 600px" src={photo.src} />
          </motion.div>
        )}
      </Container>
    </section>
  );
}
