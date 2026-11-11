export type AssortmentEntry = {
  _key?: string
  title: string
  description?: string
  ingredients?: string
  price?: number
}

export type WeeklyBakeryHighlights = {
  bread?: AssortmentEntry
  cake?: AssortmentEntry
}

export type AssortmentPromotionPreview = {
  title: string
  intro?: string
  entries?: AssortmentEntry[]
  cta?: {label: string; href: string}
}

export type AssortmentEditionData = {
  id: string
  _type?: "assortmentEdition"
  topline?: string
  heading?: string
  description?: string
  cta?: {label: string; href: string}
  bakeryHighlights?: WeeklyBakeryHighlights
  promotionPreview?: AssortmentPromotionPreview
}

export type CurrentAssortmentData = {
  enabled?: boolean
  edition: AssortmentEditionData | null
} | null
