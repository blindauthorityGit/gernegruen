"use client"

import {useMemo, useState} from "react"
import {useClient} from "sanity"
import {Button, Card, Flex, Heading, Stack, Text} from "@sanity/ui"
import ExcelJS from "exceljs"
import {readFirstSheet} from "xls-reader"
import styles from "./ProduceImportTool.module.css"

type BakeryRow = {section: "bread" | "sweet"; category: string; name: string; price: string; note: string; sourceNumber: string; sourceRow: number}
type BakeryProduct = {name: string; price: string | number; note?: string; sourceNumber?: string}
type BakeryCategory = {title: string; products: BakeryProduct[]}
type ExistingCatalog = {_id: string; _rev: string; title: string; sourceFileName?: string; breadCategories?: Array<{title: string; products: BakeryProduct[]}>; sweetCategories?: Array<{title: string; products: BakeryProduct[]}>; categories?: Array<{title: string; products: BakeryProduct[]}>}
type RowKey = "section" | "category" | "name" | "price" | "note" | "sourceNumber"

const headers: Record<RowKey, string[]> = {
  section: ["bereich", "sortimentsbereich", "bereich (brot/süss)", "bereich (brot/suess)"],
  category: ["kategorie", "produktkategorie", "warengruppe"],
  name: ["artikelbezeichnung", "produktname", "produkt", "name"],
  price: ["preis", "preis in euro", "verkaufspreis"],
  note: ["zusatzinformation", "zusatzinfo", "hinweis", "notiz"],
  sourceNumber: ["artikelnummer", "artikel-nr", "art.-nr.", "artikel nr", "code"],
}

const normalize = (value: string) => value.trim().normalize("NFKC").toLocaleLowerCase("de")
const slug = (value: string) => normalize(value).replace(/[ä]/g, "ae").replace(/[ö]/g, "oe").replace(/[ü]/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const isSweetCategory = (title: string) => /kuchen|süß|plunder|biskuit|hefe|dauergebäck|snack/i.test(title)

function formatPrice(value: string) {
  const trimmed = value.trim()
  const startsAt = /^ab\s*/i.test(trimmed)
  const numeric = trimmed.replace(/^ab\s*/i, "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")
  const amount = Number(numeric)
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  const formatted = new Intl.NumberFormat("de-DE", {style: "currency", currency: "EUR"}).format(amount)
  return `${startsAt ? "ab " : ""}${formatted}`
}

function analyze(rows: unknown[][]) {
  const headerIndex = rows.findIndex((row) => row.some((cell) => String(cell ?? "").trim()))
  if (headerIndex < 0) throw new Error("Die Datei enthält keine Tabellenzeilen.")
  const fileHeaders = rows[headerIndex].map((cell) => normalize(String(cell ?? "")))
  const indexes = Object.fromEntries(Object.entries(headers).map(([key, aliases]) => [key, fileHeaders.findIndex((header) => aliases.includes(header))])) as Record<RowKey, number>
  const missing = (["section", "category", "name", "price"] as const).filter((key) => indexes[key] < 0)
  if (missing.length) throw new Error("Benötigte Spalten: Bereich, Kategorie, Artikelbezeichnung und Preis.")

  const products: BakeryRow[] = []
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const value = (key: RowKey) => indexes[key] < 0 ? "" : String(row[indexes[key]] ?? "").trim()
    if (row.every((cell) => cell === null || cell === undefined || String(cell).trim() === "")) return
    const sectionValue = normalize(value("section"))
    const section = /^(brot|gebäck|backwaren|bread)/.test(sectionValue) ? "bread" : /^(süß|suess|sweet)/.test(sectionValue) ? "sweet" : "";
    products.push({section: section as BakeryRow["section"], category: value("category"), name: value("name"), price: value("price"), note: value("note"), sourceNumber: value("sourceNumber"), sourceRow: headerIndex + offset + 2})
  })
  if (!products.length) throw new Error("Unterhalb der Kopfzeile wurden keine Backwaren erkannt.")
  return products
}

function groupProducts(rows: BakeryRow[], section: BakeryRow["section"]): BakeryCategory[] {
  const categories = new Map<string, BakeryCategory>()
  for (const row of rows.filter((item) => item.section === section)) {
    const key = normalize(row.category)
    const category = categories.get(key) ?? {title: row.category.trim(), products: []}
    category.products.push({name: row.name.trim(), price: formatPrice(row.price) ?? row.price.trim(), ...(row.note.trim() ? {note: row.note.trim()} : {}), ...(row.sourceNumber.trim() ? {sourceNumber: row.sourceNumber.trim()} : {})})
    categories.set(key, category)
  }
  return [...categories.values()]
}

function normalizedPrice(price: string | number) {
  return formatPrice(String(price)) ?? String(price).trim()
}

export function BakeryCatalogImportTool() {
  const client = useClient({apiVersion: "2026-09-17"}).withConfig({perspective: "drafts", useCdn: false})
  const [products, setProducts] = useState<BakeryRow[]>([])
  const [fileName, setFileName] = useState("")
  const [existing, setExisting] = useState<ExistingCatalog | null>(null)
  const [phase, setPhase] = useState<"empty" | "preview" | "confirm" | "saving" | "success" | "error">("empty")
  const [message, setMessage] = useState("")

  const rowIssues = useMemo(() => products.map((product, index) => {
    const issues: string[] = []
    if (!product.section) issues.push("Bereich muss Brot & Gebäck oder Süßgebäck sein")
    if (!product.category.trim()) issues.push("Kategorie fehlt")
    if (!product.name.trim()) issues.push("Produktname fehlt")
    if (!formatPrice(product.price)) issues.push("Ungültiger Preis")
    const key = `${product.section}:${normalize(product.category)}:${normalize(product.name)}`
    if (products.some((other, otherIndex) => otherIndex !== index && `${other.section}:${normalize(other.category)}:${normalize(other.name)}` === key && normalize(product.name))) issues.push("Doppeltes Produkt in dieser Kategorie")
    return issues
  }), [products])
  const invalidCount = rowIssues.filter((issues) => issues.length > 0).length
  const canImport = products.length > 0 && invalidCount === 0

  async function selectFile(file?: File) {
    if (!file) return
    setPhase("empty"); setMessage("")
    try {
      const buffer = await file.arrayBuffer()
      let rows: unknown[][]
      if (/\.xls$/i.test(file.name) && !/\.xlsx$/i.test(file.name)) {
        const sheet = readFirstSheet(buffer)
        if (!sheet) throw new Error("In der Excel-Datei wurde kein Tabellenblatt gefunden.")
        rows = sheet.rows.map((row) => [...row])
      } else {
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(buffer)
        const sheet = workbook.worksheets[0]
        if (!sheet) throw new Error("In der Excel-Datei wurde kein Tabellenblatt gefunden.")
        rows = []
        for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
          const row = sheet.getRow(rowNumber)
          const values: unknown[] = []
          for (let columnNumber = 1; columnNumber <= sheet.columnCount; columnNumber += 1) {
            const value: unknown = row.getCell(columnNumber).value
            if (value && typeof value === "object") {
              const cell = value as {result?: unknown; text?: unknown; richText?: {text: string}[]}
              if ("result" in value) { values.push(cell.result); continue }
              if ("text" in value) { values.push(cell.text); continue }
              if ("richText" in value) { values.push(cell.richText?.map((part) => part.text).join("")); continue }
            }
            values.push(value)
          }
          rows.push(values)
        }
      }
      setProducts(analyze(rows)); setFileName(file.name); setExisting(null); setPhase("preview")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Die Datei konnte nicht gelesen werden."); setPhase("error") }
  }

  function updateProduct(index: number, key: RowKey, value: string) {
    setProducts((current) => current.map((product, rowIndex) => rowIndex === index ? {...product, [key]: value} : product))
  }

  async function prepareConfirmation() {
    if (!canImport) return
    try {
      const rawClient = client.withConfig({perspective: "raw", useCdn: false})
      const found = await rawClient.fetch<{draft: ExistingCatalog | null; published: ExistingCatalog | null}>(
        '{"draft": *[_type == "bakeryCatalog" && _id == "drafts.bakeryCatalog-main"][0]{_id,_rev,title,sourceFileName,breadCategories[]{title,products[]{name,price,note}},sweetCategories[]{title,products[]{name,price,note}},categories[]{title,products[]{name,price,note}}},"published": *[_type == "bakeryCatalog" && _id == "bakeryCatalog-main"][0]{_id,_rev,title,sourceFileName,breadCategories[]{title,products[]{name,price,note}},sweetCategories[]{title,products[]{name,price,note}},categories[]{title,products[]{name,price,note}}}}',
      )
      setExisting(found.draft ?? found.published)
      setPhase("confirm")
    } catch { setMessage("Das bestehende Backwarensortiment konnte nicht geprüft werden."); setPhase("error") }
  }

  async function importProducts() {
    if (!canImport || phase !== "confirm") return
    setPhase("saving"); setMessage("")
    const toSanityCategories = (section: BakeryRow["section"]) => groupProducts(products, section).map((category) => ({
      _key: `category-${slug(category.title)}`,
      title: category.title,
      products: category.products.map((product) => ({_key: `product-${slug(product.name)}`, ...product})),
    }))
    const breadCategories = toSanityCategories("bread")
    const sweetCategories = toSanityCategories("sweet")
    const documentId = "bakeryCatalog-main"
    const draftId = `drafts.${documentId}`
    const fields = {title: "Backwarensortiment", sourceFileName: fileName, breadCategories, sweetCategories}
    const document = {_id: draftId, _type: "bakeryCatalog" as const, ...fields}
    try {
      if (existing?._id === draftId) {
        await client.patch(draftId).ifRevisionId(existing._rev).set(fields).unset(["categories"]).commit()
      } else {
        await client.create(document)
      }
      setMessage(`${products.length} Backwaren wurden in ${breadCategories.length} Brot-Kategorien und ${sweetCategories.length} Süßgebäck-Kategorien als Sanity-Entwurf importiert.`); setPhase("success")
    } catch (error) { setMessage(error instanceof Error ? `Import fehlgeschlagen: ${error.message}` : "Import fehlgeschlagen."); setPhase("error") }
  }

  const differences = useMemo(() => {
    if (!existing) return null
    const next = new Map(([["Brot & Gebäck", "bread"], ["Süßgebäck", "sweet"]] as const).flatMap(([label, section]) => groupProducts(products, section).flatMap((category) => category.products.map((product) => [`${section}:${normalize(category.title)}:${normalize(product.name)}`, {category: `${label} · ${category.title}`, ...product}] as const))))
    const previousCategories: Array<[string, BakeryCategory[]]> = [
      ["Brot & Gebäck", existing.breadCategories ?? existing.categories?.filter((category) => !isSweetCategory(category.title)) ?? []],
      ["Süßgebäck", existing.sweetCategories ?? existing.categories?.filter((category) => isSweetCategory(category.title)) ?? []],
    ]
    const previous = new Map(previousCategories.flatMap(([label, categories]) => categories.flatMap((category) => category.products.map((product) => [`${label === "Brot & Gebäck" ? "bread" : "sweet"}:${normalize(category.title)}:${normalize(product.name)}`, {category: `${label} · ${category.title}`, ...product}] as const))))
    const added = [...next.keys()].filter((key) => !previous.has(key)).map((key) => next.get(key)!.name)
    const removed = [...previous.keys()].filter((key) => !next.has(key)).map((key) => previous.get(key)!.name)
    const changed = [...next.entries()].filter(([key, product]) => {
      const before = previous.get(key)
      return before && (normalizedPrice(before.price) !== normalizedPrice(product.price) || (before.note ?? "") !== (product.note ?? ""))
    }).map(([, product]) => product.name)
    return {added, removed, changed}
  }, [existing, products])

  return <div className={styles.tool} style={{padding: "clamp(1rem, 3vw, 2.5rem)", maxWidth: 1500, margin: "0 auto"}}>
    <Stack gap={5}>
      <Stack gap={3}><Heading size={3}>Brot & Gebäck sowie Süßgebäck importieren</Heading><Text muted>Excel-Datei für das dauerhaft gepflegte Sortiment auswählen. Dieses Sortiment ist unabhängig von Kalenderwochen.</Text><Text muted>Spalten: Bereich (Brot & Gebäck oder Süßgebäck), Kategorie, Artikelbezeichnung, Preis; Zusatzinformation ist optional. Preise wie „ab 3,20 €“ werden übernommen.</Text></Stack>
      <Card padding={4} radius={2} border><Stack gap={3}><Heading size={1}>1. Excel-Datei auswählen</Heading><Text muted>Unterstützte Formate: .xlsx und .xls.</Text><input type="file" accept=".xlsx,.xls" onChange={(event) => void selectFile(event.currentTarget.files?.[0])} /></Stack></Card>
      {phase === "error" && <Card padding={3} tone="critical" border><Text>{message}</Text></Card>}
      {products.length > 0 && <Card padding={4} radius={2} border><Stack gap={4}>
        <Heading size={1}>2. Backwaren und Preise kontrollieren</Heading>
        <Text>{products.length} Produkte · {new Set(products.map((product) => `${product.section}:${normalize(product.category)}`).filter(Boolean)).size} Kategorien · {invalidCount} fehlerhafte Zeilen</Text>
        <div style={{overflowX: "auto"}}><table style={{width: "100%", borderCollapse: "collapse", minWidth: 1040, fontSize: 13}}><thead><tr>{["Zeile", "Bereich", "Kategorie", "Artikelbezeichnung", "Preis", "Zusatzinformation", "Artikel-Nr. (optional)", "Validierung", ""].map((label) => <th key={label} style={{textAlign: "left", padding: 8, borderBottom: "1px solid #ddd"}}>{label}</th>)}</tr></thead><tbody>{products.map((product, index) => <tr key={`${product.sourceRow}-${index}`} style={{background: rowIssues[index].length ? "#fff3f0" : undefined}}>
          <td style={{padding: 6}}>{product.sourceRow}</td>
          <td style={{padding: 6}}><select aria-label={`Bereich, Zeile ${product.sourceRow}`} value={product.section} disabled={phase === "confirm" || phase === "saving" || phase === "success"} onChange={(event) => updateProduct(index, "section", event.currentTarget.value)} style={{width: 150, padding: 6, border: "1px solid #bbb", borderRadius: 4}}><option value="">Auswählen</option><option value="bread">Brot & Gebäck</option><option value="sweet">Süßgebäck</option></select></td>
          {(["category", "name", "price", "note", "sourceNumber"] as const).map((key) => <td key={key} style={{padding: 6}}><input aria-label={`${key}, Zeile ${product.sourceRow}`} value={product[key]} disabled={phase === "confirm" || phase === "saving" || phase === "success"} onChange={(event) => updateProduct(index, key, event.currentTarget.value)} style={{width: key === "name" || key === "category" ? 220 : key === "note" ? 190 : 120, padding: 6, border: "1px solid #bbb", borderRadius: 4}} /></td>)}
          <td style={{padding: 6, color: rowIssues[index].length ? "#b42318" : "#18794e"}}>{rowIssues[index].join(" · ") || "Gültig"}</td>
          <td style={{padding: 6}}><button type="button" disabled={phase === "confirm" || phase === "saving" || phase === "success"} onClick={() => setProducts((current) => current.filter((_, rowIndex) => rowIndex !== index))} aria-label={`Zeile ${product.sourceRow} entfernen`}>Entfernen</button></td>
        </tr>)}</tbody></table></div>
        <Flex justify="flex-end"><Button text="Änderungen prüfen" tone="primary" disabled={!canImport || phase === "saving" || phase === "success"} onClick={() => void prepareConfirmation()} /></Flex>
      </Stack></Card>}
      {phase === "confirm" && <Card padding={4} radius={2} border tone="caution"><Stack gap={3}><Heading size={1}>{existing ? "Bestehendes Sortiment gefunden" : "Import bestätigen"}</Heading>
        {existing ? <><Text>{existing._id === "drafts.bakeryCatalog-main" ? "Der Import ersetzt den bestehenden Entwurf. Die veröffentlichte Fassung bleibt bis zur Veröffentlichung unverändert." : "Die veröffentlichte Fassung bleibt unverändert. Der Import legt einen neuen Entwurf zur Prüfung an."}</Text><Stack gap={2}>
          <Text>Neu ({differences?.added.length ?? 0}): {differences?.added.join(", ") || "Keine"}</Text>
          <Text>Geändert ({differences?.changed.length ?? 0}): {differences?.changed.join(", ") || "Keine"}</Text>
          <Text>Entfernt ({differences?.removed.length ?? 0}): {differences?.removed.join(", ") || "Keine"}</Text>
        </Stack></> : <Text>Möchtest du diese Backwaren in Sanity als Entwurf anlegen?</Text>}
        <Flex gap={2}><Button text="Abbrechen" onClick={() => setPhase("preview")} /><Button text={existing ? "Entwurf ersetzen" : "Import bestätigen"} tone="primary" onClick={() => void importProducts()} /></Flex>
      </Stack></Card>}
      {(phase === "saving" || phase === "success") && <Card padding={4} radius={2} border tone={phase === "success" ? "positive" : "default"}><Stack gap={3}><Text>{phase === "saving" ? "Import läuft …" : message}</Text>{phase === "success" && <a href="/studio/intent/edit/id=drafts.bakeryCatalog-main;type=bakeryCatalog">Backwarensortiment in Sanity öffnen</a>}</Stack></Card>}
    </Stack>
  </div>
}

