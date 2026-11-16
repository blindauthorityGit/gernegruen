import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { createPageMetadata } from "@/lib/seo";
import { UploadForm } from "@/components/sections/upload/UploadForm";
import { UploadLogin } from "@/components/sections/upload/UploadLogin";
import { Container } from "@/components/layout/Container";
import { isUploadPasswordConfigured, isValidUploadSession, UPLOAD_SESSION_COOKIE } from "@/lib/uploads/auth";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Listen hochladen – GerneGrün",
  description: "Lade deine Listen sicher an GerneGrün hoch.",
  path: "/upload",
  noIndex: true,
});

export default async function UploadPage() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidUploadSession(cookieStore.get(UPLOAD_SESSION_COOKIE)?.value);
  const isConfigured = isUploadPasswordConfigured() && Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <main>
      <section className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Einfach & direkt</p>
          <h1 className={styles.title}>Deine Listen <span>hochladen</span></h1>
          <p className={styles.intro}>Lade deine Listen ganz einfach hoch. Die Dateien gehen direkt an unser Team.</p>
        </Container>
      </section>
      <section aria-labelledby="upload-title" className={styles.content}>
        <Container>
          <div className={styles.card}>
            <div className={styles.cardIntro}>
              <span aria-hidden="true" className={styles.icon}>
                <svg viewBox="0 0 48 48" fill="none"><path d="M24 31V8m0 0-8 8m8-8 8 8M10 28v11h28V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <h2 id="upload-title">Dateien hinzufügen</h2>
                <p>PDF, Excel oder CSV · maximal 5 Dateien, zusammen bis zu 4 MB</p>
              </div>
            </div>
            {!isConfigured ? (
              <p role="status">Der Upload ist noch nicht vollständig eingerichtet. Bitte konfiguriere das Upload-Passwort und verbinde einen privaten Vercel-Blob-Speicher mit diesem Projekt.</p>
            ) : isAuthenticated ? (
              <>
                <UploadForm />
                <p className={styles.privacy}>Deine Dateien werden während der Übertragung vorübergehend in einem privaten Vercel-Speicher zwischengespeichert und nach dem Versand an unser Team automatisch wieder gelöscht. Nicht abgeschickte Dateien werden spätestens nach einem Tag entfernt. Bitte lade nur Dateien hoch, die für deine Anfrage nötig sind. Mehr dazu in unseren <Link href="/datenschutz">Datenschutzhinweisen</Link>.</p>
              </>
            ) : (
              <UploadLogin />
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
