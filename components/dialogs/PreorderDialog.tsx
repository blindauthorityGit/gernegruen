"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { de } from "react-day-picker/locale";

import type { OrderableBakeryCategory } from "@/lib/preorder/products";

import { DialogShell, dialogStyles as styles } from "./DialogShell";

type PickupAvailability = {
  minimumDate: string;
  maximumDate: string;
  suggestedDate: string;
  holidayDates: string[];
};

type SubmitStatus = "idle" | "loading" | "success" | "stored_email_failed" | "error";
const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PreorderDialog({ isOpen, onClose, categories, pickupAvailability }: {
  isOpen: boolean;
  onClose: () => void;
  categories: OrderableBakeryCategory[];
  pickupAvailability: PickupAvailability;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState(() => pickupAvailability.suggestedDate);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const requestId = useRef<string | null>(null);
  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const selectedItems = allProducts.flatMap((product) => {
    const quantity = quantities[product.id] ?? 0;
    return quantity > 0 ? [{ ...product, quantity, lineTotalCents: product.priceCents * quantity }] : [];
  });
  const totalCents = selectedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);

  function changeQuantity(productId: string, change: number) {
    setQuantities((current) => ({ ...current, [productId]: Math.min(99, Math.max(0, (current[productId] ?? 0) + change)) }));
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (selectedItems.length === 0) {
      setStatus("error");
      setStatusMessage("Bitte wähle mindestens ein Produkt aus.");
      return;
    }

    setStatus("loading");
    setStatusMessage("");
    requestId.current ??= crypto.randomUUID();
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/bakery-preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          pickupDate,
          message: formData.get("message"),
          website: formData.get("website"),
          items: selectedItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      const result = await response.json() as { status?: SubmitStatus; message?: string };
      if (!response.ok && response.status !== 202) throw new Error(result.message || "Die Anfrage konnte nicht übermittelt werden.");
      if (result.status === "stored_email_failed") {
        setStatus("stored_email_failed");
        setStatusMessage("Deine Anfrage wurde sicher gespeichert, aber die E-Mail konnte nicht zugestellt werden. Bitte rufe uns kurz an, damit wir sie direkt bestätigen können.");
        return;
      }
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setStatusMessage(submitError instanceof Error ? submitError.message : "Die Anfrage konnte nicht übermittelt werden.");
    }
  }

  function closeDialog() {
    if (status === "success" || status === "stored_email_failed") {
      setQuantities({});
      setPickupDate(pickupAvailability.suggestedDate);
      requestId.current = null;
    }
    setStatus("idle");
    setStatusMessage("");
    onClose();
  }

  const selectedDate = parseDate(pickupDate);
  const minimumDate = parseDate(pickupAvailability.minimumDate);
  const maximumDate = parseDate(pickupAvailability.maximumDate);
  const holidayDates = pickupAvailability.holidayDates.map(parseDate);

  return (
    <DialogShell
      description={status === "success"
        ? "Deine Vorbestellungsanfrage ist per E-Mail bei uns eingegangen. Wir melden uns bald bei dir, um deine Bestellung zu bestätigen."
        : "Fülle das Formular aus. Deine Anfrage wird erst nach unserer Bestätigung verbindlich."}
      idPrefix="preorder-dialog"
      isOpen={isOpen}
      onClose={closeDialog}
      onSubmit={handleSubmit}
      title={status === "success" ? "Vielen Dank!" : "Backwaren vorbestellen"}
      wide
    >
      {status === "success" ? (
        <div className={styles.confirmation} role="status">
          <button className={styles.submit} onClick={closeDialog} type="button">Schließen</button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <label>Name<input autoComplete="name" autoFocus maxLength={100} name="name" required /></label>
            <label>E-Mail-Adresse<input autoComplete="email" maxLength={254} name="email" required type="email" /></label>
            <label>Telefonnummer<input autoComplete="tel" maxLength={50} minLength={5} name="phone" required type="tel" /></label>
            <fieldset className={`${styles.full} ${styles.dateField}`}>
              <legend>Gewünschter Abholtag</legend>
              <p className={styles.dateValue}>Ausgewählt: <strong>{new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(selectedDate)}</strong></p>
              <DayPicker
                aria-label="Abholdatum auswählen"
                className={styles.calendar}
                defaultMonth={selectedDate}
                disabled={[{ before: minimumDate }, { after: maximumDate }, { dayOfWeek: [0] }, ...holidayDates]}
                endMonth={maximumDate}
                fixedWeeks
                locale={de}
                mode="single"
                navLayout="after"
                onSelect={(date) => { if (date) setPickupDate(formatDate(date)); }}
                selected={selectedDate}
                showOutsideDays
                startMonth={minimumDate}
              />
              <input name="pickupDate" type="hidden" value={pickupDate} />
              <small>Frühestens morgen; Sonntage und gesetzliche Feiertage in Hessen sind nicht auswählbar.</small>
            </fieldset>

            <fieldset className={`${styles.full} ${styles.productPicker}`}>
              <legend>Gewünschte Backwaren</legend>
              <div className={styles.productCategories}>
                {categories.map((category, categoryIndex) => (
                  <details key={category.id} open={categoryIndex === 0}>
                    <summary><span>{category.title}</span><small>{category.products.reduce((sum, product) => sum + (quantities[product.id] ?? 0), 0) || ""}</small></summary>
                    <ul>
                      {category.products.map((product) => {
                        const quantity = quantities[product.id] ?? 0;
                        return (
                          <li key={product.id}>
                            <div><strong>{product.name}</strong>{product.note && <small>{product.note}</small>}<span>{euro.format(product.priceCents / 100)}</span></div>
                            <div className={styles.quantity} aria-label={`Menge für ${product.name}`}>
                              <button aria-label={`${product.name} reduzieren`} disabled={quantity === 0} onClick={() => changeQuantity(product.id, -1)} type="button">−</button>
                              <output aria-live="polite">{quantity}</output>
                              <button aria-label={`${product.name} hinzufügen`} disabled={quantity === 99} onClick={() => changeQuantity(product.id, 1)} type="button">+</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ))}
              </div>
            </fieldset>

            {selectedItems.length > 0 && (
              <section className={`${styles.full} ${styles.orderSummary}`} aria-labelledby="preorder-summary-title">
                <h3 id="preorder-summary-title">Deine Auswahl</h3>
                <div className={styles.summaryRows}>
                  {selectedItems.map((item) => (
                    <div key={item.id}><span>{item.quantity} × {item.name}<small>{euro.format(item.priceCents / 100)} je Stück</small></span><strong>{euro.format(item.lineTotalCents / 100)}</strong></div>
                  ))}
                </div>
                <p><span>Gesamtsumme</span><strong>{euro.format(totalCents / 100)}</strong></p>
              </section>
            )}

            <label className={styles.full}>Zusätzliche Nachricht <span>(optional)</span><textarea maxLength={2000} name="message" rows={3} /></label>
            <label className={styles.honeypot} aria-hidden="true">Website<input autoComplete="off" name="website" tabIndex={-1} /></label>
          </div>
          {statusMessage && <p className={styles.status} data-kind={status} role="status">{statusMessage}</p>}
          <div className={styles.actions}>
            <button className={styles.submit} disabled={status === "loading" || status === "stored_email_failed"} type="submit">{status === "loading" ? "Anfrage wird gesendet …" : "Vorbestellung anfragen"}</button>
            <a className={styles.phone} href="tel:+4961033867347">Oder anrufen: 06103-3867347</a>
          </div>
          <p className={styles.notice}>Mit deiner Anfrage verarbeiten wir deine Angaben zur Bearbeitung und Bestätigung der Vorbestellung. Einzelheiten stehen in der <Link href="/datenschutz">Datenschutzerklärung</Link>.</p>
        </>
      )}
    </DialogShell>
  );
}
