import styles from "./ProductCountBadge.module.css";

export function ProductCountBadge({title, text, textDataAttribute}: {title: string; text?: string; textDataAttribute?: string}) {
  return <div className={styles.badge}><strong>{title}</strong>{text && <span data-sanity={textDataAttribute}>{text}</span>}</div>;
}
