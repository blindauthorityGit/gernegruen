export type NextWeekPreviewProduct = {
  _key: string
  name: string
  label?: string
  additionalText?: string
  image: {
    src: string
    width?: number
    height?: number
    lqip?: string
  }
}

export type NextWeekPreviewData = {
  _id: string
  _updatedAt: string
  title: string
  description: string
  offerWeek: string
  publicationDate?: string
  products: NextWeekPreviewProduct[]
}
