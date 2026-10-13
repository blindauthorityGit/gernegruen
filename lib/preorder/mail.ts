import "server-only";

import nodemailer from "nodemailer";

type MailOrder = {
  requestId: string;
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  message: string;
  createdAt: Date;
  totalCents: number;
  isDev: boolean;
  items: Array<{ name: string; quantity: number; unitPriceCents: number; lineTotalCents: number }>;
};

type ProductWish = {
  requestId: string;
  product: string;
  description: string;
  name: string;
  email: string;
  createdAt: Date;
  isDev: boolean;
};

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] ?? character));

type MailSetting = "SMTP_HOST" | "SMTP_PORT" | "SMTP_USER" | "SMTP_PASSWORD" | "SMTP_FROM" | "ORDER_RECIPIENT";

function required(name: MailSetting, isDev: boolean) {
  const variable = isDev
    ? name === "ORDER_RECIPIENT" ? "ORDER_RECIPIENT_DEV" : `SMTP_DEV_${name.slice("SMTP_".length)}`
    : name;
  const value = process.env[variable];
  if (name === "SMTP_PORT" && !value && isDev) return "587";
  if (!value) throw new Error(`Fehlende Server-Konfiguration: ${variable}`);
  return value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" })
    .format(new Date(`${value}T12:00:00Z`));
}

function formatCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin",
  }).format(value);
}

export async function sendPreorderMail(order: MailOrder) {
  const port = Number.parseInt(required("SMTP_PORT", order.isDev), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Ungültige Server-Konfiguration: ${order.isDev ? "SMTP_DEV_PORT" : "SMTP_PORT"}`);

  const transporter = nodemailer.createTransport({
    host: required("SMTP_HOST", order.isDev),
    port,
    secure: port === 465,
    auth: { user: required("SMTP_USER", order.isDev), pass: required("SMTP_PASSWORD", order.isDev) },
  });
  const pickupDate = formatDate(order.pickupDate);
  const createdAt = formatCreatedAt(order.createdAt);
  const subject = `${order.isDev ? "[DEV] " : ""}Neue Backwaren-Vorbestellung – ${order.name} – ${pickupDate}`;
  const rows = order.items.map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #dce3cd">${escapeHtml(item.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #dce3cd;text-align:center">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #dce3cd;text-align:right;white-space:nowrap">${euro.format(item.unitPriceCents / 100)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #dce3cd;text-align:right;white-space:nowrap;font-weight:700">${euro.format(item.lineTotalCents / 100)}</td>
    </tr>`).join("");

  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#fbf5eb;color:#2e2e2e;font-family:Arial,sans-serif">
    <div style="max-width:720px;margin:0 auto;padding:28px 16px">
      <div style="overflow:hidden;border-radius:22px;background:#ffffff">
        <div style="padding:28px 32px;background:#08522b;color:#ffffff">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#cfe29c">GerneGrün · Vorbestellung${order.isDev ? " · Entwicklung" : ""}</div>
          <h1 style="margin:8px 0 0;font-size:28px;line-height:1.2">Neue Backwaren-Anfrage</h1>
        </div>
        <div style="padding:28px 32px">
          <h2 style="margin:0 0 12px;color:#08522b;font-size:19px">Kontaktdaten</h2>
          <p style="margin:0 0 24px;line-height:1.65"><strong>${escapeHtml(order.name)}</strong><br>
            <a href="mailto:${escapeHtml(order.email)}" style="color:#2a6a43">${escapeHtml(order.email)}</a><br>
            <a href="tel:${escapeHtml(order.phone)}" style="color:#2a6a43">${escapeHtml(order.phone)}</a><br>
            Abholung: <strong>${pickupDate}</strong></p>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr style="background:#f3f1d7;color:#08522b"><th style="padding:10px 8px;text-align:left">Produkt</th><th style="padding:10px 8px">Menge</th><th style="padding:10px 8px;text-align:right">Einzelpreis</th><th style="padding:10px 8px;text-align:right">Gesamt</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td colspan="3" style="padding:14px 8px;text-align:right;color:#08522b;font-weight:700">Gesamtsumme</td><td style="padding:14px 8px;text-align:right;color:#08522b;font-size:18px;font-weight:800">${euro.format(order.totalCents / 100)}</td></tr></tfoot>
          </table>
          <h2 style="margin:24px 0 8px;color:#08522b;font-size:19px">Zusätzliche Nachricht</h2>
          <p style="margin:0;white-space:pre-wrap;line-height:1.6">${order.message ? escapeHtml(order.message) : "Keine zusätzliche Nachricht."}</p>
          <div style="margin-top:28px;padding:16px;border-radius:12px;background:#f3f1d7;font-size:13px;line-height:1.6">
            Anfrage-ID: <strong>${escapeHtml(order.requestId)}</strong><br>Angefragt am: ${createdAt} Uhr
          </div>
        </div>
      </div>
    </div></body></html>`;

  const itemLines = order.items.map((item) =>
    `- ${item.quantity} × ${item.name} · ${euro.format(item.unitPriceCents / 100)} · ${euro.format(item.lineTotalCents / 100)}`,
  ).join("\n");
  const text = `${order.isDev ? "[DEV] " : ""}Neue Backwaren-Vorbestellung\n\nKontaktdaten\n${order.name}\n${order.email}\n${order.phone}\n\nAbholung: ${pickupDate}\n\nProdukte\n${itemLines}\n\nGesamtsumme: ${euro.format(order.totalCents / 100)}\n\nZusätzliche Nachricht\n${order.message || "Keine zusätzliche Nachricht."}\n\nAnfrage-ID: ${order.requestId}\nAngefragt am: ${createdAt} Uhr`;

  await transporter.sendMail({
    from: required("SMTP_FROM", order.isDev),
    to: required("ORDER_RECIPIENT", order.isDev),
    replyTo: order.email,
    subject,
    text,
    html,
  });
}

export async function sendProductWishMail(wish: ProductWish) {
  const port = Number.parseInt(required("SMTP_PORT", wish.isDev), 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Ungültige Server-Konfiguration: ${wish.isDev ? "SMTP_DEV_PORT" : "SMTP_PORT"}`);

  const transporter = nodemailer.createTransport({
    host: required("SMTP_HOST", wish.isDev),
    port,
    secure: port === 465,
    auth: { user: required("SMTP_USER", wish.isDev), pass: required("SMTP_PASSWORD", wish.isDev) },
  });
  const createdAt = formatCreatedAt(wish.createdAt);
  const subject = `${wish.isDev ? "[DEV] " : ""}Neuer Produktwunsch – ${wish.product}`;
  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#fbf5eb;color:#2e2e2e;font-family:Arial,sans-serif">
    <div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="overflow:hidden;border-radius:22px;background:#fff">
      <div style="padding:26px 32px;background:#08522b;color:#fff"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#cfe29c">GerneGrün · Produktwunsch${wish.isDev ? " · Entwicklung" : ""}</div><h1 style="margin:8px 0 0;font-size:26px">Neuer Produktwunsch</h1></div>
      <div style="padding:26px 32px"><h2 style="margin:0 0 8px;color:#08522b;font-size:19px">${escapeHtml(wish.product)}</h2>
      <p style="margin:0 0 24px;white-space:pre-wrap;line-height:1.6">${wish.description ? escapeHtml(wish.description) : "Keine Beschreibung angegeben."}</p>
      <h2 style="margin:0 0 8px;color:#08522b;font-size:18px">Kontakt</h2><p style="margin:0;line-height:1.7">${wish.name ? escapeHtml(wish.name) : "Kein Name angegeben"}${wish.email ? `<br><a href="mailto:${escapeHtml(wish.email)}" style="color:#2a6a43">${escapeHtml(wish.email)}</a>` : "<br>Keine E-Mail-Adresse angegeben"}</p>
      <div style="margin-top:26px;padding:15px;border-radius:12px;background:#f3f1d7;font-size:13px;line-height:1.6">Anfrage-ID: <strong>${escapeHtml(wish.requestId)}</strong><br>Eingegangen am: ${createdAt} Uhr</div></div>
    </div></div></body></html>`;
  const text = `${wish.isDev ? "[DEV] " : ""}Neuer Produktwunsch\n\nGewünschtes Produkt: ${wish.product}\n\nBeschreibung\n${wish.description || "Keine Beschreibung angegeben."}\n\nName: ${wish.name || "Nicht angegeben"}\nE-Mail: ${wish.email || "Nicht angegeben"}\n\nAnfrage-ID: ${wish.requestId}\nEingegangen am: ${createdAt} Uhr`;

  await transporter.sendMail({
    from: required("SMTP_FROM", wish.isDev),
    to: required("ORDER_RECIPIENT", wish.isDev),
    ...(wish.email ? { replyTo: wish.email } : {}),
    subject,
    text,
    html,
  });
}
