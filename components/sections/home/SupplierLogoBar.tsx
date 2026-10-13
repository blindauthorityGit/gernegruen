import Image from "next/image";

import { Container } from "@/components/layout/Container";

import styles from "./SupplierLogoBar.module.css";

type Supplier = {name: string; href?: string; src: string; width: number; height: number; description?: string};

export function SupplierLogoBar({ title, suppliers = [], showTitle = true, showEmptyState = false }: { title?: string; suppliers?: Supplier[]; showTitle?: boolean; showEmptyState?: boolean } = {}) {
  return (
    <section className={styles.section} aria-label="Unsere Marken">
      <Container>
        {showTitle && <h2 className={styles.heading}>{title ?? "Ausgewählte Marken und Hersteller"}</h2>}
        {!suppliers.length && showEmptyState && <p className={styles.empty}>Noch keine Herstellerlogos in Sanity veröffentlicht.</p>}
        <ul className={styles.list}>
          {suppliers.map((supplier) => (
            <li className={styles.item} key={supplier.name}>
              {supplier.src ? (supplier.href ? <a className={styles.link} href={supplier.href} target="_blank" rel="noreferrer" aria-label={`${supplier.name} – externe Website`}><Image
                  className={`${styles.logo} ${supplier.name === "Spielberger Mühle" ? styles.spielbergerLogo : ""}`}
                  src={supplier.src}
                  alt={supplier.name}
                  width={supplier.width}
                  height={supplier.height}
                  sizes="(max-width: 640px) 40vw, 180px"
                  unoptimized={supplier.src.toLowerCase().endsWith(".svg")}
                /></a> : <div className={styles.link}><Image className={styles.logo} src={supplier.src} alt={supplier.name} width={supplier.width} height={supplier.height} sizes="(max-width: 640px) 40vw, 180px" unoptimized={supplier.src.toLowerCase().endsWith(".svg")} /></div>) : <div className={styles.placeholder} aria-label={`${supplier.name}: Logo fehlt`}>{supplier.name}</div>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
