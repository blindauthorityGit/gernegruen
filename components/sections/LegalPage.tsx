import type {ReactNode} from "react";
import {Container} from "@/components/layout/Container";
import styles from "./LegalPage.module.css";

export function LegalPage({title, intro, children}: {title: string; intro: string; children: ReactNode}) {
  return <main className={styles.page}>
    <Container>
      <header className={styles.header}>
        <p className={styles.eyebrow}>GerneGrün · Informationen</p>
        <h1>{title}</h1>
        <p className={styles.intro}>{intro}</p>
      </header>
      <article className={styles.content}>{children}</article>
    </Container>
  </main>;
}

export function LegalSection({title, children}: {title?: string; children: ReactNode}) {
  return title ? <section className={styles.section}>
    <h2>{title}</h2>
    {children}
  </section> : <div className={styles.section}>{children}</div>;
}
