import {createClient} from "@sanity/client";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = process.cwd();
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.trim().replace(/^['"]|['"]$/g, "")]),
);
const apply = process.argv.includes("--apply");
const token = process.env.SANITY_API_TOKEN || (apply ? env.SANITY_API_TOKEN : env.SANITY_API_READ_TOKEN || env.SANITY_API_TOKEN);
if (!token) throw new Error(`Set SANITY_API_${apply ? "TOKEN" : "READ_TOKEN"} in .env.local.`);

const client = createClient({projectId: "zqaggz4f", dataset: "production", apiVersion: "2026-09-17", token, useCdn: false});
const legacyCategories = [
  {key: "fruit", title: "Obst", sortOrder: 1, showInHomepageTeaser: true},
  {key: "vegetables", title: "Gemüse", sortOrder: 2, showInHomepageTeaser: true},
  {key: "saladsHerbs", title: "Salate & Kräuter", sortOrder: 3, showInHomepageTeaser: true},
  {key: "mushrooms", title: "Pilze", sortOrder: 4, showInHomepageTeaser: true},
  {key: "other", title: "Weitere Produkte", sortOrder: 5, showInHomepageTeaser: false},
];
const byLegacyKey = Object.fromEntries(legacyCategories.map((category) => [category.key, category]));
const categoryTerms = {
  mushrooms: ["champignon", "steinpilz", "pfifferling", "seitling", "shiitake", "morchel", "pilz"],
  saladsHerbs: ["salat", "chicorée", "chicoree", "radicchio", "rucola", "rauke", "spinat", "mangold", "koriander", "petersilie", "basilikum", "schnittlauch", "dill", "minze", "kräuter", "kraeuter"],
  fruit: ["apfel", "birne", "quit", "zitrone", "limette", "orange", "mandarine", "clementine", "grapefruit", "pomelo", "guave", "kiwi", "avocado", "banane", "mango", "melone", "kaki", "pflaum", "zwetsch", "traube", "weinbeere", "himbeere", "heidelbeere", "blaubeere", "erdbeere", "brombeere", "johannisbeere", "stachelbeere", "kirsche", "dattel", "feige", "granatapfel", "papaya", "ananas", "kokos"],
  vegetables: ["tomat", "zucchini", "brokkoli", "blumenkohl", "bananenblüte", "wirsing", "gurke", "kohl", "möhre", "moehre", "karotte", "paprika", "chili", "kohlrabi", "süßkartoffel", "suesskartoffel", "kartoffel", "ingwer", "bohne", "schalotte", "zwiebel", "knoblauch", "porree", "lauch", "pastinak", "kürbis", "kuerbis", "sellerie", "fenchel", "spargel", "aubergine", "rettich", "radieschen", "rote bete", "rübe", "ruebe", "mais", "erbs"],
};

function classify(product) {
  const override = byLegacyKey[product.categoryOverride];
  if (override) return override;
  const name = String(product.name ?? "").normalize("NFKC").toLocaleLowerCase("de");
  // A variety such as "Romatomaten Orange" is a tomato; the word orange is not its category.
  if (name.includes("tomat")) return byLegacyKey.vegetables;
  for (const key of ["mushrooms", "saladsHerbs", "fruit", "vegetables"]) {
    if (categoryTerms[key].some((term) => name.includes(term))) return byLegacyKey[key];
  }
  return byLegacyKey.other;
}

const rawClient = client.withConfig({perspective: "raw"});
const [categoryDocuments, lists] = await Promise.all([
  rawClient.fetch('*[_type == "produceCategory"]{_id,_rev,title,sortOrder,showInHomepageTeaser}'),
  rawClient.fetch('*[_type == "weeklyProduceList"]{_id,_rev,title,week,year,isArchived,products[]}'),
]);

const categoryIdByTitle = new Map();
for (const category of categoryDocuments) {
  if (!category._id.startsWith("drafts.")) categoryIdByTitle.set(category.title, category._id);
}
for (const category of legacyCategories) {
  if (!categoryIdByTitle.has(category.title) && categoryDocuments.some((document) => document.title === category.title)) {
    throw new Error(`Category "${category.title}" exists only as a draft. Publish it before linking products.`);
  }
}

const documentIds = new Map(categoryIdByTitle);
if (apply) {
  for (const category of legacyCategories) {
    if (documentIds.has(category.title)) continue;
    const created = await client.create({_type: "produceCategory", title: category.title, sortOrder: category.sortOrder, showInHomepageTeaser: category.showInHomepageTeaser});
    documentIds.set(category.title, created._id);
  }
} else {
  for (const category of legacyCategories) {
    if (!documentIds.has(category.title)) documentIds.set(category.title, `[created on apply: ${category.title}]`);
  }
}

const plan = lists.map((list) => {
  const counts = Object.fromEntries(legacyCategories.map(({title}) => [title, 0]));
  const products = (list.products ?? []).map((product) => {
    if (product.category?._ref) {
      const known = categoryDocuments.find((category) => category._id === product.category._ref);
      if (known) counts[known.title] = (counts[known.title] ?? 0) + 1;
      return product;
    }
    const category = classify(product);
    counts[category.title] += 1;
    return {...product, category: {_type: "reference", _ref: documentIds.get(category.title)}};
  });
  return {list, products, counts};
});

console.log(`${apply ? "APPLY" : "DRY RUN"}: ${legacyCategories.length} standard categories, ${lists.length} weekly list documents.`);
for (const category of legacyCategories) console.log(`- ${category.title} (Sortierung ${category.sortOrder}${category.showInHomepageTeaser ? ", Startseiten-Teaser" : ""})`);
for (const {list, products, counts} of plan) {
  const changes = (list.products ?? []).filter((product) => !product.category?._ref).length;
  console.log(`- ${list._id} · ${list.title ?? `KW ${list.week}/${list.year}`} · ${changes} Produkte zu verknüpfen · ${Object.entries(counts).map(([title, count]) => `${title}: ${count}`).join(", ")}`);
  if (apply && changes > 0) {
    await client.patch(list._id).ifRevisionId(list._rev).set({products}).commit();
  }
}

if (!apply) console.log("No Sanity data changed. Re-run with --apply to create categories and link products.");
else console.log("Categories are published and product references were added to each list without replacing other product fields.");
