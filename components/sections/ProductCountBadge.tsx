import styles from "./ProductCountBadge.module.css";

export function ProductCountBadge({title, text}: {title: string; text?: string}) {
  return <div className={styles.badge}><strong>{title}</strong>{text && <span>{text}</span>}</div>;
}
