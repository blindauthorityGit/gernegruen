"use client"

import {useMemo, useState} from "react"
import {useClient} from "sanity"
import {Button, Card, Flex, Heading, Stack, Text, TextInput} from "@sanity/ui"
import ExcelJS from "exceljs"
import {readFirstSheet} from "xls-reader"
import styles from "./ProduceImportTool.module.css"

type Product = {name: string; unit: string; price: string; origin: string; certification: string; bioladenCertified: string; sourceRow: number}
type ExistingProduct = {name: string; normalizedName?: string; unit: string; price: number; brand?: string; originalBrandMarker?: string; origin?: string; originRegion?: string; certification?: string; bioStatus?: "confirmed" | "unconfirmed" | "unknown"; bioEvidenceReference?: string; bioladenCertified?: boolean; categoryOverride?: string}
type ExistingList = {_id: string; _rev: string; title: string; products: ExistingProduct[]}
type Column = keyof Omit<Product, "sourceRow">
const columns: {key: Column; header: string}[] = [
  {key: "name", header: "Artikelbezeichnung"}, {key: "unit", header: "Einheit kg/Stk"}, {key: "price", header: "Preis pro Einheit"},
  {key: "origin", header: "Herkunft"}, {key: "certification", header: "Verband/Zertifikat"}, {key: "bioladenCertified", header: "Bioladen Zertifikat Ja/Nein"},
]
const normalize = (value: string) => value.trim().normalize("NFKC").toLocaleLowerCase("de")
const parsePrice = (value: string) => {
  const normalized = value.trim().replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")
  return normalized && /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN
}

function analyze(rows: unknown[][], fileName: string) {
  const headerIndex = rows.findIndex((row) => row.some((cell) => String(cell ?? "").trim()))
  if (headerIndex < 0) throw new Error("Die Datei enthält keine Tabellenzeilen.")
  const headers = rows[headerIndex].map((cell) => normalize(String(cell ?? "")))
  const indexes = columns.map(({header}) => headers.indexOf(normalize(header)))
  const requiredColumns: Column[] = ["name", "unit", "price"]
  const missing = columns.filter(({key}, index) => requiredColumns.includes(key) && indexes[index] < 0).map(({header}) => header)
  if (missing.length) throw new Error(`Erforderliche Spalten fehlen: ${missing.join(", ")}`)
  const products: Product[] = []
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const values = indexes.map((index) => index < 0 ? undefined : row[index])
    if (values.every((value) => value === undefined || value === null || String(value).trim() === "")) return
    products.push({
      name: String(values[0] ?? ""), unit: String(values[1] ?? ""), price: String(values[2] ?? ""),
      origin: String(values[3] ?? ""), certification: String(values[4] ?? ""), bioladenCertified: String(values[5] ?? ""), sourceRow: headerIndex + offset + 2,
    })
  })
  if (!products.length) throw new Error("Unterhalb der Kopfzeile wurden keine Produkte erkannt.")
  const weekMatch = fileName.match(/\bKW\s*0?(\d{1,2})\b/i)
  const yearMatch = fileName.match(/\b(20\d{2})\b/)
  return {products, week: weekMatch ? Number(weekMatch[1]) : undefined, year: yearMatch ? Number(yearMatch[1]) : undefined}
}

export function ProduceImportTool() {
  const client = useClient({apiVersion: "2026-09-17"}).withConfig({perspective: "drafts", useCdn: false})
  const [products, setProducts] = useState<Product[]>([])
  const [fileName, setFileName] = useState("")
  const [week, setWeek] = useState("")
  const [year, setYear] = useState("")
  const [existing, setExisting] = useState<ExistingList | null>(null)
  const [phase, setPhase] = useState<"empty" | "preview" | "confirm" | "saving" | "success" | "error">("empty")
  const [message, setMessage] = useState("")

  const rowIssues = useMemo(() => products.map((product, index) => {
    const issues: string[] = []
    if (!product.name.trim()) issues.push("Produktname fehlt")
    if (!/^(kg|kilo(?:gramm)?|stk|stück|stueck)$/i.test(product.unit.trim())) issues.push("Einheit muss kg oder Stück sein")
    if (!Number.isFinite(parsePrice(product.price)) || parsePrice(product.price) < 0) issues.push("Ungültiger Preis")
    if (products.some((other, otherIndex) => otherIndex !== index && normalize(other.name) === normalize(product.name) && normalize(product.name))) issues.push("Doppelter Produktname")
    return issues
  }), [products])
  const validCount = rowIssues.filter((issues) => issues.length === 0).length
  const errorCount = rowIssues.filter((issues) => issues.some((issue) => issue !== "Doppelter Produktname")).length
  const duplicateCount = rowIssues.filter((issues) => issues.includes("Doppelter Produktname")).length
  const weekNumber = Number(week), yearNumber = Number(year)
  const weekIssue = !Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 53 || !Number.isInteger(yearNumber) || yearNumber < 2020 || yearNumber > 2100
  const canImport = products.length > 0 && errorCount === 0 && duplicateCount === 0 && !weekIssue

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
      const parsed = analyze(rows, file.name)
      setProducts(parsed.products); setFileName(file.name); setWeek(parsed.week ? String(parsed.week) : ""); setYear(parsed.year ? String(parsed.year) : "")
      setExisting(null); setPhase("preview")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Die Datei konnte nicht gelesen werden."); setPhase("error") }
  }

  function updateProduct(index: number, key: Column, value: string) {
    setProducts((current) => current.map((product, i) => i === index ? {...product, [key]: value} : product))
  }

  async function prepareConfirmation() {
    if (!canImport) return
    try {
      const found = await client.fetch<ExistingList | null>(
        '*[_type == "weeklyProduceList" && week == $week && year == $year] | order(_updatedAt desc)[0]{_id, _rev, title, products[]{name, normalizedName, unit, price, brand, originalBrandMarker, origin, originRegion, certification, bioStatus, bioEvidenceReference, bioladenCertified, categoryOverride}}',
        {week: weekNumber, year: yearNumber},
      )
      setExisting(found ? {...found, products: found.products ?? []} : null)
      setPhase("confirm")
    } catch { setMessage("Die bestehende Wochenliste konnte nicht geprüft werden."); setPhase("error") }
  }

  async function importProducts() {
    if (!canImport || phase !== "confirm") return
    setPhase("saving"); setMessage("")
    const documentId = `weeklyProduceList-${yearNumber}-${String(weekNumber).padStart(2, "0")}`
    const now = new Date().toISOString()
    const normalizedProducts = products.map((product, index) => {
      const unit = product.unit.trim()
      const isKg = /^(kg|kilo(?:gramm)?)$/i.test(unit)
      const legacyFlag = /^(ja|yes|true|1)$/i.test(product.bioladenCertified.trim())
        ? true
        : /^(nein|no|false|0)$/i.test(product.bioladenCertified.trim()) ? false : undefined
      const price = parsePrice(product.price)
      const previous = existing?.products.find((item) => (item.normalizedName || normalize(item.name)) === normalize(product.name))
      const marker = /^b\*/i.test(product.name.trim()) ? product.name.trim().slice(0, 2) : undefined
      return {
        _key: `product-${index + 1}`,
        name: product.name,
        normalizedName: normalize(product.name),
        unit,
        unitKind: isKg ? "kg" : "piece",
        price,
        ...(marker ? {brand: "bioladen*", originalBrandMarker: marker} : previous?.brand ? {brand: previous.brand, ...(previous.originalBrandMarker ? {originalBrandMarker: previous.originalBrandMarker} : {})} : {}),
        ...((product.origin.trim() || previous?.origin) ? {origin: product.origin.trim() || previous?.origin} : {}),
        ...(previous?.originRegion ? {originRegion: previous.originRegion} : {}),
        ...((product.certification.trim() || previous?.certification) ? {certification: product.certification.trim() || previous?.certification} : {}),
        bioStatus: previous?.bioStatus ?? "unknown",
        ...(previous?.bioEvidenceReference ? {bioEvidenceReference: previous.bioEvidenceReference} : {}),
        ...((legacyFlag !== undefined || previous?.bioladenCertified !== undefined) ? {bioladenCertified: legacyFlag ?? previous?.bioladenCertified} : {}),
        order: index + 1,
        ...(previous?.categoryOverride ? {categoryOverride: previous.categoryOverride} : {}),
      }
    })
    try {
      const draftId = `drafts.${documentId}`
      const fields = {
        title: `Obst & Gemüse – KW ${weekNumber}/${yearNumber}`,
        week: weekNumber,
        year: yearNumber,
        importedAt: now,
        importStatus: "imported",
        isArchived: false,
        productCount: normalizedProducts.length,
        sourceFileName: fileName,
        products: normalizedProducts,
      }
      const document = {_id: draftId, _type: "weeklyProduceList" as const, ...fields}
      if (existing?._id.startsWith("drafts.")) {
        await client.patch(draftId).ifRevisionId(existing._rev).set(fields).commit()
      } else {
        // create() fails on a race instead of silently replacing a draft created after comparison.
        await client.create(document)
      }
      setMessage(`${normalizedProducts.length} Produkte wurden als Entwurf importiert.`); setPhase("success")
    } catch (error) { setMessage(error instanceof Error ? `Import fehlgeschlagen: ${error.message}` : "Import fehlgeschlagen."); setPhase("error") }
  }

  const differences = useMemo(() => {
    if (!existing) return null
    const next = new Map(products.map((product) => [normalize(product.name), product]))
    const previous = new Map(existing.products.map((product) => [product.normalizedName || normalize(product.name), product]))
    const added = [...next.keys()].filter((key) => !previous.has(key)).map((key) => next.get(key)!.name)
    const removed = [...previous.keys()].filter((key) => !next.has(key)).map((key) => previous.get(key)!.name)
    const changed = [...next.entries()].filter(([key, product]) => {
      const before = previous.get(key)
      const parsedLegacyFlag = /^(ja|yes|true|1)$/i.test(product.bioladenCertified.trim()) ? true : /^(nein|no|false|0)$/i.test(product.bioladenCertified.trim()) ? false : undefined
      return before && (before.unit !== product.unit || before.price !== parsePrice(product.price) || (before.origin ?? "") !== product.origin || (before.certification ?? "") !== product.certification || (parsedLegacyFlag !== undefined && before.bioladenCertified !== parsedLegacyFlag))
    }).map(([, product]) => product.name)
    return {added, removed, changed}
  }, [existing, products])

  return <div className={styles.tool} style={{padding: "clamp(1rem, 3vw, 2.5rem)", maxWidth: 1600, margin: "0 auto"}}>
    <Stack gap={5}>
      <Stack gap={4}><Heading size={3}>Produktlisten importieren</Heading><Text muted>Excel-Datei prüfen und Obst- & Gemüseliste als Sanity-Entwurf übernehmen.</Text><Text muted>Ein Präfix b* im Originalnamen wird als Produktmarke bioladen* erkannt. Verbands- und Bio-Angaben bleiben getrennte Lieferantenangaben und werden beim Import nicht als geprüft bestätigt. Die frühere Spalte „Bioladen-Zertifikat“ wird nur aus Kompatibilitätsgründen übernommen und erzeugt keinen öffentlichen Claim.</Text></Stack>
      <Card padding={4} radius={2} border><Stack gap={3}><Heading size={1}>1. Excel-Datei auswählen</Heading><Text muted>Unterstützte Formate: .xlsx und .xls. Artikelbezeichnung, Einheit und Preis sind erforderlich; weitere Spalten sind optional.</Text><input type="file" accept=".xlsx,.xls" onChange={(event) => void selectFile(event.currentTarget.files?.[0])} /></Stack></Card>
      {phase === "error" && <Card padding={3} tone="critical" border><Text>{message}</Text></Card>}
      {products.length > 0 && <>
        <Card padding={4} radius={2} border><Stack gap={4}>
          <Heading size={1}>2. Woche und Daten kontrollieren</Heading>
          <Flex gap={3} wrap="wrap" align="flex-end">
            <Stack gap={2}><Text size={1} weight="semibold">Kalenderwoche</Text><TextInput type="number" min="1" max="53" value={week} disabled={phase === "confirm" || phase === "saving" || phase === "success"} onChange={(event) => setWeek(event.currentTarget.value)} /></Stack>
            <Stack gap={2}><Text size={1} weight="semibold">Jahr (bitte prüfen)</Text><TextInput type="number" min="2020" max="2100" value={year} disabled={phase === "confirm" || phase === "saving" || phase === "success"} onChange={(event) => setYear(event.currentTarget.value)} placeholder="Jahr eingeben" /></Stack>
            <Text>{products.length} erkannt · {validCount} gültig · {errorCount} fehlerhaft · {duplicateCount} mögliche Duplikatzeilen</Text>
          </Flex>
          {weekIssue && <Text size={1} style={{color: "#b42318"}}>Bitte eine Kalenderwoche von 1 bis 53 und ein Jahr von 2020 bis 2100 eingeben.</Text>}
          <div style={{overflowX: "auto"}}><table style={{width: "100%", borderCollapse: "collapse", minWidth: 1280, fontSize: 13}}><thead><tr>{["Zeile", "Artikelbezeichnung (Original)", "Einheit", "Preis pro Einheit", "Herkunftsland", "Verbands-/Bio-Angabe (Lieferant)", "Alt: Bioladen-Zertifikat (Legacy)", "Erkannte Produktmarke", "Bio-Status / Nachweis", "Validierung", ""].map((label) => <th key={label} style={{textAlign: "left", padding: 8, borderBottom: "1px solid #ddd"}}>{label}</th>)}</tr></thead><tbody>{products.map((product, index) => <tr key={`${product.sourceRow}-${index}`} style={{background: rowIssues[index].length ? "#fff3f0" : undefined}}>
            <td style={{padding: 6}}>{product.sourceRow}</td>
            {columns.map(({key}) => <td key={key} style={{padding: 6}}><input aria-label={`${columns.find((column) => column.key === key)?.header}, Zeile ${product.sourceRow}`} value={product[key]} disabled={phase === "confirm" || phase === "saving" || phase === "success"} onChange={(event) => updateProduct(index, key, event.currentTarget.value)} style={{width: key === "name" ? 230 : key === "origin" || key === "certification" ? 140 : 100, padding: 6, border: "1px solid #bbb", borderRadius: 4}} /></td>)}
            <td style={{padding: 6}}>{/^b\*/i.test(product.name.trim()) ? "bioladen* (aus Präfix b*)" : "Keine eindeutige Marke erkannt"}</td>
            <td style={{padding: 6}}>Unbekannt · {product.certification.trim() ? "Lieferantenangabe; kein Beleg aus Excel, nicht unabhängig geprüft" : "kein Bio-/Verbandsnachweis"}</td>
            <td style={{padding: 6, color: rowIssues[index].length ? "#b42318" : "#18794e"}}>{rowIssues[index].length ? rowIssues[index].join(" · ") : "Gültig"}</td>
            <td style={{padding: 6}}><button type="button" disabled={phase === "confirm" || phase === "saving" || phase === "success"} onClick={() => setProducts((current) => current.filter((_, rowIndex) => rowIndex !== index))} aria-label={`Zeile ${product.sourceRow} entfernen`}>Entfernen</button></td>
          </tr>)}</tbody></table></div>
          <Flex justify="flex-end"><Button text="Vorschau erneut prüfen" tone="primary" disabled={!canImport || phase === "saving"} onClick={() => void prepareConfirmation()} /></Flex>
        </Stack></Card>
      </>}
      {phase === "confirm" && <Card padding={4} radius={2} border tone="caution"><Stack gap={3}><Heading size={1}>{existing ? "Bestehende Wochenliste gefunden" : "Import bestätigen"}</Heading>
        {existing ? <><Text>Für KW {weekNumber}/{yearNumber} existiert bereits „{existing.title}“. Möchtest du diese {products.length} Produkte für KW {weekNumber}/{yearNumber} übernehmen und den Entwurf vollständig ersetzen? Eine veröffentlichte Fassung bleibt bis zur erneuten Veröffentlichung unverändert.</Text><Stack gap={2}>
          <Text>Neu ({differences?.added.length ?? 0}): {differences?.added.join(", ") || "Keine"}</Text>
          <Text>Geändert ({differences?.changed.length ?? 0}): {differences?.changed.join(", ") || "Keine"}</Text>
          <Text>Nicht mehr enthalten ({differences?.removed.length ?? 0}): {differences?.removed.join(", ") || "Keine"}</Text>
        </Stack></> : <Text>Möchtest du diese {products.length} Produkte für KW {weekNumber}/{yearNumber} in Sanity übernehmen?</Text>}
        <Flex gap={2}><Button text="Abbrechen" onClick={() => setPhase("preview")} /><Button text={existing ? "Entwurf vollständig ersetzen" : "Import bestätigen"} tone="primary" onClick={() => void importProducts()} /></Flex>
      </Stack></Card>}
      {(phase === "saving" || phase === "success") && <Card padding={4} radius={2} border tone={phase === "success" ? "positive" : "default"}><Stack gap={3}><Text>{phase === "saving" ? "Import läuft …" : message}</Text>{phase === "success" && <a href={`/studio/intent/edit/id=drafts.weeklyProduceList-${yearNumber}-${String(weekNumber).padStart(2, "0")};type=weeklyProduceList`}>Wochenliste in Sanity öffnen</a>}</Stack></Card>}
    </Stack>
  </div>
}
