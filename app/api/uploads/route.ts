import { del, get } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { sendCustomerListUploadMail } from "@/lib/preorder/mail";
import { isValidUploadPathname, isValidUploadSession, UPLOAD_SESSION_COOKIE } from "@/lib/uploads/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILES = 5;
const MAX_BYTES = 4 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
};
const attempts = new Map<string, { count: number; resetAt: number }>();

function response(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function rateLimited(ip: string) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  const value = attempts.get(ip);
  if (!value || value.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  value.count += 1;
  return value.count > 5;
}

function safeFilename(value: string) {
  const basename = value.replace(/\\/g, "/").split("/").pop() || "liste";
  return basename.replace(/[\u0000-\u001f\u007f]/g, "_").slice(0, 150) || "liste";
}

type UploadedFile = { pathname: string; name: string };

export async function POST(request: NextRequest) {
  if (!isValidUploadSession(request.cookies.get(UPLOAD_SESSION_COOKIE)?.value)) {
    return response("Bitte melde dich mit dem Upload-Passwort an.", 401);
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return response("Zu viele Uploads. Bitte versuche es in einigen Minuten erneut.", 429);
  if (Number(request.headers.get("content-length") || 0) > 32 * 1024) return response("Die Upload-Anfrage ist ungültig.", 413);

  let body: { files?: unknown; message?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return response("Die Anfrage konnte nicht gelesen werden.", 400); }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length > 1200) return response("Bitte kürze deine Nachricht und versuche es erneut.", 400);
  if (!Array.isArray(body.files) || body.files.length < 1 || body.files.length > MAX_FILES) {
    return response("Bitte wähle 1 bis 5 Dateien aus.", 400);
  }

  const files = body.files as UploadedFile[];
  if (files.some((file) => !file || !isValidUploadPathname(file.pathname)
    || !/^customer-lists\/[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/.test(file.pathname)
    || typeof file.name !== "string" || file.name.length > 150)) {
    return response("Die Dateiliste ist ungültig. Bitte lade deine Dateien erneut hoch.", 400);
  }
  if (new Set(files.map((file) => file.pathname)).size !== files.length) return response("Die Dateiliste enthält doppelte Einträge.", 400);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return response("Der sichere Dateispeicher ist noch nicht eingerichtet.", 503);

  const filesWithContent: Array<{ name: string; content: Buffer; contentType: string; pathname: string; size: number }> = [];
  let totalBytes = 0;
  try {
    for (const file of files) {
      const extension = file.pathname.split(".").pop()?.toLowerCase() || "";
      const expectedContentType = allowedTypes[extension];
      const blob = await get(file.pathname, { access: "private", useCache: false });
      if (!blob || blob.statusCode !== 200) return response("Eine Datei ist abgelaufen oder nicht mehr verfügbar. Bitte lade deine Listen erneut hoch.", 400);
      if (!expectedContentType || blob.blob.contentType !== expectedContentType || blob.blob.size < 1) {
        return response("Bitte lade nur PDF-, Excel- oder CSV-Dateien hoch.", 400);
      }
      totalBytes += blob.blob.size;
      if (totalBytes > MAX_BYTES) return response("Die Dateien dürfen zusammen höchstens 4 MB groß sein.", 413);
      filesWithContent.push({
        pathname: file.pathname,
        name: safeFilename(file.name),
        contentType: expectedContentType,
        size: blob.blob.size,
        content: Buffer.from(await new Response(blob.stream).arrayBuffer()),
      });
    }
  } catch {
    console.error("Temporäre Listen-Dateien konnten nicht gelesen werden.");
    return response("Die Dateien konnten nicht gelesen werden. Bitte versuche es erneut.", 503);
  }

  const requestId = crypto.randomUUID();
  const devFlag = process.env.BAKERY_PREORDER_DEV;
  const isDev = devFlag === "true" || (devFlag !== "false" && process.env.NODE_ENV !== "production");
  try {
    await sendCustomerListUploadMail({
      requestId,
      message,
      createdAt: new Date(),
      isDev,
      files: filesWithContent.map(({ name, content, contentType }) => ({ name, content, contentType })),
    });
  } catch {
    console.error("Listen-Upload konnte nicht an das feste Empfängerpostfach gesendet werden.");
    return response("Der Upload konnte gerade nicht per E-Mail zugestellt werden. Die Dateien bleiben verschlüsselt zwischengespeichert; bitte versuche es erneut.", 503);
  }

  try {
    await del(filesWithContent.map((file) => file.pathname));
  } catch {
    console.error("Temporäre Listen-Dateien konnten nicht direkt gelöscht werden; die automatische Löschfrist bleibt aktiv.");
  }

  return NextResponse.json({ message: "Vielen Dank! Deine Dateien sind bei uns angekommen." });
}
