import {fetchSanity} from "@/sanity/lib/live"
import {stegaClean} from "next-sanity"
import {CURRENT_WEEKLY_PRODUCE_LIST_QUERY} from "@/sanity/queries/weekly"
import type {ProduceProductCategory} from "./produce-categories"

export {categorizeProduce, getProduceTeaserProducts} from "./produce-categories"
export type {ProduceCategory} from "./produce-categories"

export type WeeklyProduceProduct = ProduceProductCategory & {
  _key: string
  unit?: string
  unitKind?: "kg" | "piece"
  price?: number
  brand?: string
  originalBrandMarker?: string
  origin?: string
  originRegion?: string
  certification?: string
  order?: number
}

export type WeeklyProduceList = {
  _id?: string
  _type?: "weeklyProduceList"
  week: number
  year: number
  products: WeeklyProduceProduct[]
}

export function formatIsoWeekDateRange(week: number, year: number) {
  const dayMs = 24 * 60 * 60 * 1000
  const januaryFourth = new Date(Date.UTC(year, 0, 4))
  const mondayOffset = (januaryFourth.getUTCDay() + 6) % 7
  const start = new Date(januaryFourth.getTime() - mondayOffset * dayMs + (week - 1) * 7 * dayMs)
  const end = new Date(start.getTime() + 6 * dayMs)
  const format = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat("de-AT", {day: "numeric", month: "long", year: "numeric", timeZone: "UTC"}).formatToParts(date).map((part) => [part.type, part.value])) as Record<string, string>
  const from = format(start)
  const to = format(end)

  if (from.month === to.month && from.year === to.year) return `${from.day}.–${to.day}. ${to.month}`
  if (from.year === to.year) return `${from.day}. ${from.month}–${to.day}. ${to.month}`
  return `${from.day}. ${from.month} ${from.year}–${to.day}. ${to.month} ${to.year}`
}

export function getProductBrand(product: Pick<WeeklyProduceProduct, "name" | "brand" | "originalBrandMarker">): string | undefined {
  if (product.brand && stegaClean(product.brand).trim()) return product.brand.trim()
  if ((product.originalBrandMarker && stegaClean(product.originalBrandMarker).trim() === "b*") || /^b\*/i.test(stegaClean(product.name).trim())) return "bioladen*"
  return undefined
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
