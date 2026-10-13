"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

import styles from "./Dialogs.module.css";

type DialogShellProps = {
  children: ReactNode;
  description: string;
  idPrefix: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  wide?: boolean;
};

export function DialogShell({ children, description, idPrefix, isOpen, onClose, onSubmit, title, wide = false }: DialogShellProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.scrollTop = 0;
      dialog.showModal();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      aria-describedby={`${idPrefix}-description`}
      aria-labelledby={`${idPrefix}-title`}
      className={`${styles.dialog} ${wide ? styles.dialogWide : ""}`}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      ref={ref}
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <button aria-label="Dialog schließen" className={styles.close} onClick={onClose} type="button">×</button>
        <header className={styles.header}>
          <p className={styles.eyebrow}>GerneGrün Service</p>
          <h2 id={`${idPrefix}-title`}>{title}</h2>
          <p id={`${idPrefix}-description`}>{description}</p>
        </header>
        {children}
      </form>
    </dialog>
  );
}

export { styles as dialogStyles };
