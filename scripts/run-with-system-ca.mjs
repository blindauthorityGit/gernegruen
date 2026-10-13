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
        : null;

if (!entry) throw new Error("Choose `next`, `seed`, `seed-homepage`, `seed-assortment-gallery`, `seed-about-page`, or `seed-contact-page`.");

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
