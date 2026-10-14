import {fetchSanity} from "@/sanity/lib/live"
import {NEXT_WEEK_PREVIEWS_QUERY} from "@/sanity/queries/nextWeekPreview"
import {stegaClean} from "next-sanity"

import {getPreviewWindow, getUpcomingMonday, isPreviewVisible} from "./preview-schedule"
import type {NextWeekPreviewData} from "./preview-types"

function hasValidProducts(preview: NextWeekPreviewData) {
  return preview.products.some((product) => Boolean(product._key && stegaClean(product.name ?? "").trim() && stegaClean(product.image?.src ?? "")))
}

export async function getNextWeekPreview(now = new Date()): Promise<NextWeekPreviewData | null> {
  const offerWeek = getUpcomingMonday(now)
  const previews = await fetchSanity<NextWeekPreviewData[]>(NEXT_WEEK_PREVIEWS_QUERY, {offerWeek})
    .catch((error: unknown) => {
      console.error("Vorschau für nächste Woche konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler")
      return []
    })

  const current = previews
    .filter((preview) => hasValidProducts(preview) && isPreviewVisible(stegaClean(preview.offerWeek), preview.publicationDate ? stegaClean(preview.publicationDate) : preview.publicationDate, now))
    .sort((left, right) => {
      const leftStart = getPreviewWindow(stegaClean(left.offerWeek), left.publicationDate ? stegaClean(left.publicationDate) : left.publicationDate)?.start.valueOf() ?? 0
      const rightStart = getPreviewWindow(stegaClean(right.offerWeek), right.publicationDate ? stegaClean(right.publicationDate) : right.publicationDate)?.start.valueOf() ?? 0
      return rightStart - leftStart || stegaClean(right._updatedAt).localeCompare(stegaClean(left._updatedAt)) || left._id.localeCompare(right._id)
    })[0]

  if (current) {
    return {...current, offerWeek: stegaClean(current.offerWeek), products: current.products.filter((product) => stegaClean(product.name ?? "").trim() && stegaClean(product.image?.src ?? ""))}
  }

  return null
}
