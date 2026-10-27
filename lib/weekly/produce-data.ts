import {fetchSanity} from "@/sanity/lib/live"
import {stegaClean} from "next-sanity"
import {CURRENT_WEEKLY_PRODUCE_LIST_QUERY} from "@/sanity/queries/weekly"

export type ProduceCategory = "fruit" | "vegetables" | "saladsHerbs" | "mushrooms" | "other"

export type WeeklyProduceProduct = {
  _key: string
  name: string
  unit?: string
  unitKind?: "kg" | "piece"
  price?: number
  brand?: string
  originalBrandMarker?: string
  origin?: string
  originRegion?: string
  certification?: string
  order?: number
  categoryOverride?: ProduceCategory
}

export type WeeklyProduceList = {
  _id?: string
  _type?: "weeklyProduceList"
  week: number
  year: number
  products: WeeklyProduceProduct[]
}

export const produceCategoryOrder: {id: ProduceCategory; title: string}[] = [
  {id: "fruit", title: "Obst"},
  {id: "vegetables", title: "Gemüse"},
  {id: "saladsHerbs", title: "Salate & Kräuter"},
  {id: "mushrooms", title: "Pilze"},
  {id: "other", title: "Weitere Produkte"},
]

export function getProductBrand(product: Pick<WeeklyProduceProduct, "name" | "brand" | "originalBrandMarker">): string | undefined {
  if (product.brand && stegaClean(product.brand).trim()) return product.brand.trim()
  if ((product.originalBrandMarker && stegaClean(product.originalBrandMarker).trim() === "b*") || /^b\*/i.test(stegaClean(product.name).trim())) return "bioladen*"
  return undefined
}

const normalized = (name: string) => name.normalize("NFKC").toLocaleLowerCase("de")

const categoryMatchers: {category: ProduceCategory; terms: string[]}[] = [
  {category: "mushrooms", terms: ["champignon", "steinpilz", "pfifferling", "seitling", "shiitake", "morchel", "pilz"]},
  {category: "saladsHerbs", terms: ["salat", "feldsalat", "chicorée", "chicoree", "radicchio", "rucola", "rauke", "spinat", "mangold", "koriander", "petersilie", "basilikum", "schnittlauch", "dill", "minze", "kräuter", "kraeuter"]},
  {category: "fruit", terms: ["apfel", "birne", "quit", "zitrone", "limette", "orange", "mandarine", "clementine", "grapefruit", "pomelo", "guave", "kiwi", "avocado", "banane", "mango", "melone", "kaki", "pflaum", "zwetsch", "traube", "weinbeere", "himbeere", "heidelbeere", "blaubeere", "erdbeere", "brombeere", "johannisbeere", "stachelbeere", "kirsche", "dattel", "feige", "granatapfel", "papaya", "ananas", "kokos"]},
  {category: "vegetables", terms: ["tomat", "zucchini", "brokkoli", "blumenkohl", "bananenblüte", "wirsing", "gurke", "kohl", "möhre", "moehre", "karotte", "paprika", "chili", "kohlrabi", "süßkartoffel", "suesskartoffel", "kartoffel", "ingwer", "bohne", "schalotte", "zwiebel", "knoblauch", "porree", "lauch", "pastinak", "kürbis", "kuerbis", "sellerie", "fenchel", "spargel", "aubergine", "rettich", "radieschen", "rote bete", "rübe", "ruebe", "mais", "erbs"]},
]

export function categorizeProduce(product: WeeklyProduceProduct): ProduceCategory {
  const categoryOverride = product.categoryOverride ? stegaClean(product.categoryOverride) : undefined
  if (categoryOverride && produceCategoryOrder.some(({id}) => id === categoryOverride)) return categoryOverride
  const name = normalized(stegaClean(product.name))
  return categoryMatchers.find(({terms}) => terms.some((term) => name.includes(term)))?.category ?? "other"
}

export function getProduceTeaserProducts(list: WeeklyProduceList | null, limit = 4): WeeklyProduceProduct[] {
  if (!list?.products.length || limit <= 0) return []
  const preferredCategories: ProduceCategory[] = ["fruit", "vegetables", "saladsHerbs", "mushrooms"]
  const selected = preferredCategories
    .map((category) => list.products.find((product) => categorizeProduce(product) === category))
    .filter((product): product is WeeklyProduceProduct => Boolean(product))
    .slice(0, limit)
  const selectedKeys = new Set(selected.map((product) => product._key))
  for (const product of list.products) {
    if (selected.length >= limit) break
    if (!selectedKeys.has(product._key)) {
      selected.push(product)
      selectedKeys.add(product._key)
    }
  }
  return selected
}

function isoWeekAndYear(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - weekday + 3)
  const isoYear = date.getUTCFullYear()
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4))
  const firstWeekday = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstWeekday + 3)
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604800000)
  return {week, year: isoYear}
}

export function getCurrentIsoWeek(timeZone = "Europe/Vienna") {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return isoWeekAndYear(value("year"), value("month"), value("day"))
}

export async function getCurrentWeeklyProduceList(): Promise<WeeklyProduceList | null> {
  try {
    const data = await fetchSanity<WeeklyProduceList | null>(CURRENT_WEEKLY_PRODUCE_LIST_QUERY)
    if (!data || !Array.isArray(data.products) || data.products.length === 0) return null
    return {...data, products: [...data.products].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
  } catch (error) {
    console.error("Aktuelle Obst- und Gemüseliste konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler")
    return null
  }
}
