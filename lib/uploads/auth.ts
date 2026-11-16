import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const UPLOAD_SESSION_COOKIE = "gg_upload_session";
export const UPLOAD_SESSION_SECONDS = 12 * 60 * 60;

function uploadPassword() {
  return process.env.UPLOAD_PASSWORD?.trim() || "";
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function isUploadPasswordConfigured() {
  return uploadPassword().length >= 12;
}

export function isValidUploadPassword(candidate: string) {
  const expected = uploadPassword();
  return expected.length >= 12 && candidate.length <= 256 && safeEqual(candidate, expected);
}

function signature(timestamp: string, password: string) {
  return createHmac("sha256", password).update(`gernegruen-upload:${timestamp}`).digest("base64url");
}

export function createUploadSession() {
  const password = uploadPassword();
  if (password.length < 12) throw new Error("Upload-Passwort ist nicht konfiguriert.");
  const timestamp = String(Date.now());
  return `${timestamp}.${signature(timestamp, password)}`;
}

export function isValidUploadSession(value: string | undefined) {
  const password = uploadPassword();
  if (password.length < 12 || !value) return false;
  const [timestamp, suppliedSignature, extra] = value.split(".");
  if (!timestamp || !suppliedSignature || extra || !/^\d{13}$/.test(timestamp)) return false;
  const createdAt = Number(timestamp);
  const age = Date.now() - createdAt;
  if (age < 0 || age > UPLOAD_SESSION_SECONDS * 1000) return false;
  return safeEqual(suppliedSignature, signature(timestamp, password));
}

export function isValidUploadPathname(value: unknown): value is string {
  return typeof value === "string"
    && value.startsWith("customer-lists/")
    && value.length <= 240
    && !value.includes("..")
    && !/[\\\u0000-\u001f\u007f]/.test(value);
}
