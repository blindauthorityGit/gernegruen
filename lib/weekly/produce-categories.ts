import {stegaClean} from "next-sanity"

export type ProduceCategory = {
  id: string
  title: string
  sortOrder: number
  showInHomepageTeaser?: boolean
}

type LegacyProduceCategoryId = "fruit" | "vegetables" | "saladsHerbs" | "mushrooms" | "other"

export type ProduceProductCategory = {
  _key: string
  name: string
  category?: {_id: string; title: string; sortOrder?: number; showInHomepageTeaser?: boolean} | null
  categoryOverride?: LegacyProduceCategoryId
}

const legacyProduceCategories: (ProduceCategory & {terms: string[]})[] = [
  {id: "fruit", title: "Obst", sortOrder: 1, terms: ["apfel", "birne", "quit", "zitrone", "limette", "orange", "mandarine", "clementine", "grapefruit", "pomelo", "guave", "kiwi", "avocado", "banane", "mango", "melone", "kaki", "pflaum", "zwetsch", "traube", "weinbeere", "himbeere", "heidelbeere", "blaubeere", "erdbeere", "brombeere", "johannisbeere", "stachelbeere", "kirsche", "dattel", "feige", "granatapfel", "papaya", "ananas", "kokos"]},
  {id: "vegetables", title: "Gemüse", sortOrder: 2, terms: ["tomat", "zucchini", "brokkoli", "blumenkohl", "bananenblüte", "wirsing", "gurke", "kohl", "möhre", "moehre", "karotte", "paprika", "chili", "kohlrabi", "süßkartoffel", "suesskartoffel", "kartoffel", "ingwer", "bohne", "schalotte", "zwiebel", "knoblauch", "porree", "lauch", "pastinak", "kürbis", "kuerbis", "sellerie", "fenchel", "spargel", "aubergine", "rettich", "radieschen", "rote bete", "rübe", "ruebe", "mais", "erbs"]},
  {id: "saladsHerbs", title: "Salate & Kräuter", sortOrder: 3, terms: ["salat", "chicorée", "chicoree", "radicchio", "rucola", "rauke", "spinat", "mangold", "koriander", "petersilie", "basilikum", "schnittlauch", "dill", "minze", "kräuter", "kraeuter"]},
  {id: "mushrooms", title: "Pilze", sortOrder: 4, terms: ["champignon", "steinpilz", "pfifferling", "seitling", "shiitake", "morchel", "pilz"]},
  {id: "other", title: "Weitere Produkte", sortOrder: 5, showInHomepageTeaser: false, terms: []},
]

const normalized = (name: string) => name.normalize("NFKC").toLocaleLowerCase("de")

export function categorizeProduce(product: ProduceProductCategory): ProduceCategory {
  if (product.category?._id && product.category.title) {
    return {
      id: stegaClean(product.category._id),
      title: stegaClean(product.category.title),
      sortOrder: product.category.sortOrder ?? Number.MAX_SAFE_INTEGER,
      showInHomepageTeaser: product.category.showInHomepageTeaser,
    }
  }

  const categoryOverride = product.categoryOverride ? stegaClean(product.categoryOverride) : undefined
  const legacyOverride = legacyProduceCategories.find(({id}) => id === categoryOverride)
  if (legacyOverride) return legacyOverride
  const name = normalized(stegaClean(product.name))
  if (name.includes("tomat")) return legacyProduceCategories.find(({id}) => id === "vegetables")!
  const matchingOrder: LegacyProduceCategoryId[] = ["mushrooms", "saladsHerbs", "fruit", "vegetables"]
  return matchingOrder
    .map((id) => legacyProduceCategories.find((category) => category.id === id))
    .find((category) => category?.terms.some((term) => name.includes(term))
    ) ?? legacyProduceCategories[4]
}

export function getProduceTeaserProducts<T extends ProduceProductCategory>(list: {products: T[]} | null, limit = 4): T[] {
  if (!list?.products.length || limit <= 0) return []
  const categories = [...new Map(list.products.map((product) => categorizeProduce(product)).map((category) => [category.id, category])).values()]
    .filter((category) => category.showInHomepageTeaser !== false)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title, "de"))
  const selected = categories
    .map((category) => list.products.find((product) => categorizeProduce(product).id === category.id))
    .filter((product): product is T => Boolean(product))
    .slice(0, limit)
  const selectedKeys = new Set(selected.map((product) => product._key))
  for (const product of list.products) {
    if (selected.length >= limit) break
    if (categorizeProduce(product).showInHomepageTeaser === false) continue
    if (!selectedKeys.has(product._key)) {
      selected.push(product)
      selectedKeys.add(product._key)
    }
  }
  return selected
}
