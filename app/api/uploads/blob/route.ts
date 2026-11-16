import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { isValidUploadSession, isValidUploadPathname, UPLOAD_SESSION_COOKIE } from "@/lib/uploads/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
};

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ message: "Der sichere Dateispeicher ist noch nicht eingerichtet." }, { status: 503 });
  }

  let body: HandleUploadBody;
  try { body = await request.json() as HandleUploadBody; }
  catch { return NextResponse.json({ message: "Die Upload-Anfrage konnte nicht gelesen werden." }, { status: 400 }); }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidUploadSession(request.cookies.get(UPLOAD_SESSION_COOKIE)?.value)) {
          throw new Error("Nicht angemeldet.");
        }
        if (!isValidUploadPathname(pathname) || !/^customer-lists\/[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/.test(pathname)) {
          throw new Error("Ungültiger Dateipfad.");
        }
        const extension = pathname.split(".").pop()?.toLowerCase() || "";
        const contentType = allowedTypes[extension];
        if (!contentType) throw new Error("Nicht unterstützter Dateityp.");

        return {
          allowedContentTypes: [contentType],
          maximumSizeInBytes: MAX_FILE_BYTES,
          validUntil: Date.now() + 15 * 60_000,
          ttlDays: 1,
        };
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Der Upload konnte nicht vorbereitet werden. Bitte melde dich erneut an oder versuche es später noch einmal." }, { status: 400 });
  }
}
