"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import styles from "./UploadForm.module.css";

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "xls", "xlsx", "csv"];
const ACCEPT = ".pdf,.xls,.xlsx,.csv";
type StagedUpload = { key: string; pathname: string; name: string; size: number };
const fileKeys = new WeakMap<File, string>();

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(file: File) {
  const existingKey = fileKeys.get(file);
  if (existingKey) return existingKey;
  const key = crypto.randomUUID();
  fileKeys.set(file, key);
  return key;
}

function safePathName(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 100) || "liste";
}

function safeAttachmentName(value: string) {
  return value.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 150) || "liste";
}

function contentTypeFor(value: string) {
  const extension = value.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "xls") return "application/vnd.ms-excel";
  if (extension === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "text/csv";
}

function validateFiles(files: File[]) {
  if (!files.length) return "Bitte wähle mindestens eine Datei aus.";
  if (files.length > MAX_FILES) return `Bitte wähle höchstens ${MAX_FILES} Dateien aus.`;
  if (files.some((file) => !ACCEPTED_EXTENSIONS.includes(file.name.split(".").pop()?.toLowerCase() || ""))) return "Bitte nutze PDF-, Excel- oder CSV-Dateien.";
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) return "Die Dateien dürfen zusammen höchstens 4 MB groß sein.";
  return "";
}

export function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<StagedUpload[]>([]);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function addFiles(incoming: File[]) {
    setResult(null);
    const next = [...files, ...incoming];
    const error = validateFiles(next);
    if (error && next.length) {
      setResult({ kind: "error", text: error });
      return;
    }
    setFiles(next);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileError = validateFiles(files);
    if (fileError) { setResult({ kind: "error", text: fileError }); return; }
    setIsSubmitting(true);
    setResult(null);
    let staged = uploadedFiles.filter((item) => files.some((file) => fileKey(file) === item.key));
    try {
      for (const [index, file] of files.entries()) {
        if (staged.some((item) => item.key === fileKey(file))) continue;
        setProgress(`Lade Datei ${index + 1} von ${files.length} hoch …`);
        const pathname = `customer-lists/${crypto.randomUUID()}-${safePathName(file.name)}`;
        await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/uploads/blob",
          contentType: contentTypeFor(file.name),
        });
        staged = [...staged, { key: fileKey(file), pathname, name: safeAttachmentName(file.name), size: file.size }];
        setUploadedFiles(staged);
      }

      setProgress("Sende deine Listen an GerneGrün …");
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files: staged.map(({ pathname, name }) => ({ pathname, name })), message }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || "Der Upload hat nicht geklappt. Bitte versuche es noch einmal.");
      setFiles([]);
      setUploadedFiles([]);
      setMessage("");
      setResult({ kind: "success", text: "Vielen Dank! Deine Dateien sind bei uns angekommen." });
    } catch (error) {
      setResult({ kind: "error", text: error instanceof Error ? error.message : "Der Upload hat nicht geklappt. Bitte versuche es noch einmal." });
    } finally {
      setProgress("");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label
        className={styles.dropzone}
        data-dragging={isDragging || undefined}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input ref={inputRef} accept={ACCEPT} className={styles.fileInput} disabled={isSubmitting} multiple onChange={onFileChange} type="file" />
        <span className={styles.dropIcon} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 21V5m0 0-6 6m6-6 6 6M6 19v8h20v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <span className={styles.dropTitle}>Dateien hier ablegen</span>
        <span className={styles.dropHint}>oder <span className={styles.browse}>Dateien auswählen</span></span>
      </label>

      {files.length > 0 && <ul className={styles.fileList} aria-label="Ausgewählte Dateien">
        {files.map((file, index) => <li className={styles.file} key={`${file.name}-${file.lastModified}-${index}`}>
          <span aria-hidden="true" className={styles.fileBadge}>{file.name.split(".").pop()?.toUpperCase()}</span>
          <span className={styles.fileDetails}><span className={styles.fileName}>{file.name}</span><span className={styles.fileSize}>{formatSize(file.size)}{uploadedFiles.some((item) => item.key === fileKey(file)) ? " · bereit zum Senden" : ""}</span></span>
          <button aria-label={`${file.name} entfernen`} className={styles.remove} disabled={isSubmitting} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} type="button">×</button>
        </li>)}
      </ul>}

      <label className={styles.field}>Nachricht <span className={styles.optional}>optional</span>
        <textarea maxLength={1200} onChange={(event) => setMessage(event.currentTarget.value)} placeholder="Zum Beispiel für welche Woche die Liste gedacht ist …" rows={3} value={message} />
      </label>

      {progress && <p className={styles.progress} aria-live="polite">{progress}</p>}
      {result && <p className={styles.result} data-kind={result.kind} role={result.kind === "error" ? "alert" : "status"}>{result.text}</p>}
      <button className={styles.submit} disabled={isSubmitting || !files.length} type="submit">{isSubmitting ? "Wird gesendet …" : "Listen senden"}<span aria-hidden="true">→</span></button>
    </form>
  );
}
