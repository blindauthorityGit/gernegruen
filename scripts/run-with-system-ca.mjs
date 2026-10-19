import {spawn} from "node:child_process";
import {resolve} from "node:path";

const [target, ...args] = process.argv.slice(2);
const entry = target === "next"
  ? resolve("node_modules/next/dist/bin/next")
  : target === "seed"
    ? resolve("scripts/seed-assortment.mjs")
    : target === "seed-homepage"
      ? resolve("scripts/seed-homepage-sanity.mjs")
      : target === "seed-assortment-gallery"
        ? resolve("scripts/seed-assortment-gallery.mjs")
      : target === "seed-about-page"
        ? resolve("scripts/seed-about-page.mjs")
        : target === "seed-contact-page"
          ? resolve("scripts/seed-contact-page.mjs")
          : target === "seed-weekly-editorial"
            ? resolve("scripts/seed-weekly-editorial.mjs")
            : target === "repair-business-settings-keys"
              ? resolve("scripts/repair-business-settings-keys.mjs")
              : target === "seed-footer-settings"
                ? resolve("scripts/seed-footer-settings.mjs")
                : target === "update-imprint-settings"
                  ? resolve("scripts/update-imprint-settings.mjs")
                  : target === "audit-firestore-retention"
                    ? resolve("scripts/audit-firestore-retention.mjs")
                    : target === "enable-firestore-retention"
                      ? resolve("scripts/enable-firestore-retention.mjs")
        : null;

if (!entry) throw new Error("Choose `next`, `seed`, `seed-homepage`, `seed-assortment-gallery`, `seed-about-page`, `seed-contact-page`, `seed-weekly-editorial`, `repair-business-settings-keys`, `seed-footer-settings`, `update-imprint-settings`, `audit-firestore-retention`, or `enable-firestore-retention`.");

const child = spawn(process.execPath, [entry, ...args], {
  stdio: "inherit",
  env: {...process.env, NODE_USE_SYSTEM_CA: "1"},
});

child.on("error", (error) => {
  console.error(`Command failed: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
