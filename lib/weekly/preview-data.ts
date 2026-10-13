import {sanityClient} from "@/sanity/lib/client"
import {NEXT_WEEK_PREVIEWS_QUERY} from "@/sanity/queries/nextWeekPreview"

import {nextWeekPreviewMock} from "./preview-mock-data"
import {getPreviewWindow, getUpcomingMonday, isPreviewVisible} from "./preview-schedule"
import type {NextWeekPreviewData} from "./preview-types"

function hasValidProducts(preview: NextWeekPreviewData) {
  return preview.products.some((product) => Boolean(product._key && product.name?.trim() && product.image?.src))
}

export async function getNextWeekPreview(now = new Date()): Promise<NextWeekPreviewData | null> {
  const offerWeek = getUpcomingMonday(now)
  const previews = await sanityClient
    .fetch<NextWeekPreviewData[]>(
      NEXT_WEEK_PREVIEWS_QUERY,
      {offerWeek},
      {useCdn: false, cache: "no-store", next: {revalidate: 0}},
    )
    .catch((error: unknown) => {
      console.error("Vorschau für nächste Woche konnte nicht aus Sanity geladen werden:", error instanceof Error ? error.message : "Unbekannter Fehler")
      return []
    })

  const current = previews
    .filter((preview) => hasValidProducts(preview) && isPreviewVisible(preview.offerWeek, preview.publicationDate, now))
    .sort((left, right) => {
      const leftStart = getPreviewWindow(left.offerWeek, left.publicationDate)?.start.valueOf() ?? 0
      const rightStart = getPreviewWindow(right.offerWeek, right.publicationDate)?.start.valueOf() ?? 0
      return rightStart - leftStart || right._updatedAt.localeCompare(left._updatedAt) || left._id.localeCompare(right._id)
    })[0]

  if (current) {
    return {...current, products: current.products.filter((product) => product.name?.trim() && product.image?.src)}
  }

  const developmentPreviewEnabled = process.env.NODE_ENV === "development" && process.env.NEXT_WEEK_PREVIEW_DEV !== "false"
  return developmentPreviewEnabled ? nextWeekPreviewMock : null
}
