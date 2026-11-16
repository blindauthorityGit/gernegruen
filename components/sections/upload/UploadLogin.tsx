"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./UploadLogin.module.css";

export function UploadLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/uploads/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || "Das Passwort stimmt nicht.");
      setPassword("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Anmeldung hat nicht geklappt.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <p className={styles.intro}>Dieser Upload-Bereich ist passwortgeschützt.</p>
      <label className={styles.field} htmlFor="upload-password">Passwort
        <input
          autoComplete="current-password"
          id="upload-password"
          maxLength={256}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} disabled={isSubmitting || !password} type="submit">
        {isSubmitting ? "Wird geprüft …" : "Zum Upload"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
