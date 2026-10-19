"use client"

import {useEffect, useMemo, useState} from "react"
import {Button, Card, Flex, Heading, Spinner, Stack, Text, TextInput} from "@sanity/ui"
import styles from "./OrdersDashboardTool.module.css"

type Entry = {id: string; name?: string; email?: string; phone?: string; product?: string; description?: string; pickupDate?: string; products?: {name?: string; quantity?: number; unitPriceCents?: number}[]; totalCents?: number; message?: string; status?: string; createdAt?: string; expiresAt?: string; lastSubstantiveActivityAt?: string; contractConcludedAt?: string; completedAt?: string; archiveVerifiedAt?: string}
type Data = {orders: Entry[]; wishes: Entry[]}
type AuthResult = {idToken?: string; error?: {message?: string}}
const statusLabels: Record<string,string> = {pending:"Neu",in_progress:"In Bearbeitung",confirmed:"Bestätigt",completed:"Erledigt",cancelled:"Storniert",read:"Gelesen"}
const date = (value?: string) => value ? new Intl.DateTimeFormat("de-AT", {dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Vienna"}).format(new Date(value)) : "–"

export function OrdersDashboardTool() {
  const [data, setData] = useState<Data>({orders:[],wishes:[]})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{type:"order"|"wish"; entry:Entry}|null>(null)
  const [now] = useState(() => Date.now())
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)
  const [updating, setUpdating] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const fresh = (entry:Entry) => !entry.status || entry.status==="pending"
  const count = (items:Entry[]) => items.filter(fresh).length

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/studio/session",{signal:controller.signal}).then(response=>response.ok?setAuthenticated(true):setAuthenticated(false)).catch(()=>setAuthenticated(false)).finally(()=>{if(!controller.signal.aborted)setCheckingSession(false)})
    return ()=>controller.abort()
  },[])

  useEffect(() => {
    if (!authenticated) return
    const controller = new AbortController()
    fetch("/api/studio/requests", {signal:controller.signal}).then(async response => {
      const result = await response.json()
      if (response.status === 401) setAuthenticated(false)
      if (!response.ok) throw new Error(result.message || "Anfragen konnten nicht geladen werden.")
      setData(result)
    }).catch(reason => {if (reason.name !== "AbortError") setError(reason.message)}).finally(() => setLoading(false))
    return () => controller.abort()
  }, [authenticated])

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("de-AT")
    const match = (entry:Entry) => !needle || [entry.id,entry.name,entry.product,entry.description,...(entry.products ?? []).map(item=>item.name)].some(value=>value?.toLocaleLowerCase("de-AT").includes(needle))
    return {orders:data.orders.filter(match), wishes:data.wishes.filter(match)}
  },[data,search])
  const recent = now-30*24*60*60*1000
  const done = [...data.orders,...data.wishes].filter(entry=>entry.status==="completed"&&entry.createdAt&&new Date(entry.createdAt).getTime()>=recent).length
  const stats: [string,number][] = [["Neue Bestellungen",count(data.orders)],["Offene Bestellungen",data.orders.filter(item=>!["completed","cancelled"].includes(item.status??"")).length],["Neue Kundenwünsche",count(data.wishes)],["Erledigt · 30 Tage",done]]

  async function signIn(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if(!apiKey) {setError("NEXT_PUBLIC_FIREBASE_API_KEY fehlt in der Umgebungs-Konfiguration.");return}
    setAuthBusy(true);setError("")
    try {
      const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim(),password,returnSecureToken:true})})
      const result:AuthResult=await response.json()
      if(!response.ok || !result.idToken) {
        const code=result.error?.message?.split(" ")[0]??""
        const messages:Record<string,string>={INVALID_LOGIN_CREDENTIALS:"E-Mail oder Passwort stimmt nicht.",EMAIL_NOT_FOUND:"Für diese E-Mail-Adresse gibt es kein Firebase-Konto.",INVALID_PASSWORD:"Das Passwort stimmt nicht.",USER_DISABLED:"Dieses Konto wurde in Firebase deaktiviert.",OPERATION_NOT_ALLOWED:"E-Mail/Passwort ist in Firebase Authentication nicht aktiviert.",API_KEY_INVALID:"Der Firebase-Web-API-Schlüssel ist ungültig.",PROJECT_NOT_FOUND:"Der Firebase-Web-API-Schlüssel gehört zu keinem verfügbaren Projekt.",TOO_MANY_ATTEMPTS_TRY_LATER:"Zu viele Anmeldeversuche. Bitte später erneut versuchen."}
        throw new Error(messages[code]??`Firebase-Anmeldung fehlgeschlagen (${code||response.status}). Prüfe Auth-Anbieter und API-Schlüssel.`)
      }
      const sessionResponse=await fetch("/api/studio/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:result.idToken})})
      const sessionResult=await sessionResponse.json()
      if(!sessionResponse.ok) throw new Error(sessionResult.message||"Sichere Sitzung konnte nicht erstellt werden.")
      setLoading(true);setAuthenticated(true);setPassword("")
    } catch(reason) {setError(reason instanceof Error?reason.message:"Anmeldung fehlgeschlagen.")} finally {setAuthBusy(false)}
  }

  function open(type:"order"|"wish", entry:Entry) {setSelected({type,entry})}
  async function updateRequest(action:"record-activity"|"complete-wish"|"confirm-order"|"complete-order"|"archive-order"|"cancel-order") {
    if (!selected || updating) return
    if (action === "archive-order" && !window.confirm("Wurde ein aufbewahrungspflichtiger Nachweis separat und ordnungsgemäß archiviert? Nur dann darf diese Vorbestellung nach 90 Tagen automatisch gelöscht werden.")) return
    setUpdating(true);setError("")
    try {
      const response = await fetch("/api/studio/requests", {method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:selected.type,id:selected.entry.id,action})})
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Status konnte nicht gespeichert werden.")
      const refreshed = await fetch("/api/studio/requests")
      if (!refreshed.ok) throw new Error("Der Status wurde gespeichert, aber die Liste konnte nicht neu geladen werden.")
      setData(await refreshed.json())
      setSelected(null)
    } catch(reason) {setError(reason instanceof Error?reason.message:"Status konnte nicht gespeichert werden.")}
    finally {setUpdating(false)}
  }
  const list = (type:"order"|"wish", items:Entry[]) => <Card className={styles.sectionCard} padding={4} border radius={2}><Stack gap={3}><Heading className={styles.sectionTitle} size={2}>{type==="order"?"Backwaren-Bestellungen":"Kundenwünsche"}</Heading>{items.length===0?<Text muted>Keine passenden Anfragen.</Text>:<div className={styles.tableWrap}><table className={styles.table}><thead><tr>{["Eingang","Kunde",...(type==="order"?["Abholung","Artikel","Gesamtpreis"]:["Kontakt","Wunsch"]),"Status",""].map(label=><th className={styles.tableHead} key={label}>{label}</th>)}</tr></thead><tbody>{items.map(entry=><tr className={`${styles.row} ${fresh(entry)?styles.newRow:""}`} key={entry.id}><td className={styles.cell} style={{whiteSpace:"nowrap"}}>{date(entry.createdAt)}</td><td className={styles.cell}>{entry.name||"Nicht angegeben"}</td>{type==="order"?<><td className={styles.cell}>{entry.pickupDate||"–"}</td><td className={styles.cell}>{entry.products?.map(item=>`${item.quantity??1}× ${item.name}`).join(", ")||"–"}</td><td className={styles.cell} style={{whiteSpace:"nowrap"}}>{typeof entry.totalCents==="number"?new Intl.NumberFormat("de-AT",{style:"currency",currency:"EUR"}).format(entry.totalCents/100):"–"}</td></>:<><td className={styles.cell}>{entry.email||"–"}</td><td className={styles.cell}>{entry.product||entry.description||"–"}</td></>}<td className={styles.cell}>{fresh(entry)?<span className={styles.newBadge}>Neu</span>:<span className={styles.statusBadge}>{statusLabels[entry.status??""]??entry.status}</span>}</td><td className={styles.cell}><Button mode="ghost" text="Details ansehen" onClick={()=>open(type,entry)}/></td></tr>)}</tbody></table></div>}</Stack></Card>

  if(checkingSession)return <div className={styles.login}><Flex align="center" justify="center" gap={3}><Spinner/><Text>Prüfe Anmeldung …</Text></Flex></div>
  if(!authenticated)return <div className={styles.login}><div className={styles.loginInner}><div><Text className={styles.eyebrow}>GERNEGRÜN · STUDIO</Text><Heading className={styles.loginHeading} size={3}>Bestellungen & Wünsche</Heading><Text muted>Einmal anmelden. Die Sitzung bleibt auf diesem Gerät bis zu 14 Tage aktiv.</Text></div>{!apiKey&&<Card padding={4} tone="caution" border><Text>Für den Login fehlt <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>. Trage den Web-API-Schlüssel aus den Firebase-Projekteinstellungen in `.env.local` ein und starte Next.js neu.</Text></Card>}{error&&<Card padding={3} tone="critical" border><Text>{error}</Text></Card>}<Card className={styles.loginCard} padding={4} border radius={2}><form onSubmit={event=>void signIn(event)}><Stack gap={3}><label>E-Mail<TextInput type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.currentTarget.value)}/></label><label>Passwort<TextInput type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.currentTarget.value)}/></label><Button type="submit" text={authBusy?"Melde an …":"Anmelden"} tone="primary" disabled={authBusy||!apiKey}/><Text muted>Nur freigeschaltete Konten können Anfragen ansehen. Eine Registrierung ist hier nicht möglich.</Text></Stack></form></Card></div></div>
  if(loading)return <div className={styles.dashboard}><Flex align="center" justify="center" padding={6} gap={3}><Spinner/><Text>Lade Anfragen …</Text></Flex></div>
  return <main className={styles.dashboard}><div className={styles.content}><Stack className={styles.stack} gap={5}><header className={styles.hero}><Text className={styles.eyebrow}>GERNEGRÜN · ANFRAGEN</Text><Heading className={styles.heroTitle} size={3}>Bestellungen & Wünsche</Heading><Text className={styles.heroDescription}>Anfragen bearbeiten und Aufbewahrungsfristen nachvollziehen.</Text></header>
    <Flex justify="flex-end"><Button text="Abmelden" mode="ghost" onClick={()=>{void fetch("/api/studio/session",{method:"DELETE"});setAuthenticated(false);setLoading(false);setData({orders:[],wishes:[]});setError("")}}/></Flex>
    {error&&<Card padding={4} tone="caution" border><Stack gap={2}><Text weight="semibold">Dashboard nicht verfügbar</Text><Text>{error}</Text></Stack></Card>}
    <div className={styles.stats}>{stats.map(([label,value])=><Card className={styles.statCard} key={label} padding={4} border radius={2}><Stack gap={2}><Text className={styles.statLabel}>{label}</Text><Heading className={styles.statValue} size={3}>{value}</Heading></Stack></Card>)}</div>
    <TextInput className={styles.search} aria-label="Suche" placeholder="Name, Bestellnummer oder Produkt suchen" value={search} onChange={event=>setSearch(event.currentTarget.value)}/>{list("order",filtered.orders)}{list("wish",filtered.wishes)}
    {selected&&<Card className={styles.detailCard} padding={4} border radius={2}><Stack gap={4}><Flex justify="space-between" align="center"><Heading className={styles.sectionTitle} size={2}>{selected.type==="order"?"Bestellung":"Kundenwunsch"} · {selected.entry.id}</Heading><Button text="Schließen" mode="ghost" onClick={()=>setSelected(null)}/></Flex><Text>{date(selected.entry.createdAt)} · {selected.entry.name||"Name nicht angegeben"} · {selected.entry.email||"Keine E-Mail"} {selected.entry.phone||""}</Text>{selected.type==="order"?<><Text>Abholung: {selected.entry.pickupDate||"–"}</Text><Stack gap={2}>{(selected.entry.products??[]).map((item,index)=><Text key={`${item.name}-${index}`}>{item.quantity??1} × {item.name} · {((item.unitPriceCents??0)/100).toLocaleString("de-AT",{style:"currency",currency:"EUR"})}</Text>)}</Stack><Text>Gesamt: {((selected.entry.totalCents??0)/100).toLocaleString("de-AT",{style:"currency",currency:"EUR"})}</Text><Text>{selected.entry.message||"Keine Kundenanmerkung"}</Text></>:<Text>{selected.entry.product}{selected.entry.description?` — ${selected.entry.description}`:""}</Text>}</Stack></Card>}    {selected && <Card className={styles.detailCard} padding={4} border radius={2}><Stack gap={3}>
      <Heading className={styles.sectionTitle} size={2}>Bearbeitung und Löschung</Heading>
      {selected.type === "wish" ? <>
        <Text>Geplantes Löschdatum: {date(selected.entry.expiresAt)}</Text>
        <Flex gap={2} wrap="wrap">
          <Button text="Bearbeitung dokumentieren" disabled={updating} onClick={() => void updateRequest("record-activity")}/>
          {selected.entry.status !== "completed" && <Button text="Als erledigt markieren" tone="positive" disabled={updating} onClick={() => void updateRequest("complete-wish")}/>}
        </Flex>
      </> : <>
        <Text>{selected.entry.expiresAt ? `Geplantes Löschdatum: ${date(selected.entry.expiresAt)}` : selected.entry.status === "completed" ? "Automatische Löschung bleibt gesperrt, bis der erforderliche Nachweis separat archiviert wurde." : "Für bestätigte Vorbestellungen ist bis zum Abschluss und zur Archivierung keine automatische Löschung geplant."}</Text>
        {selected.entry.status === "pending" || selected.entry.status === "in_progress" ? <Flex gap={2} wrap="wrap">
          <Button text="Vorbestellung bestätigen" tone="positive" disabled={updating} onClick={() => void updateRequest("confirm-order")}/>
          <Button text="Stornieren" mode="ghost" disabled={updating} onClick={() => void updateRequest("cancel-order")}/>
        </Flex> : selected.entry.status === "confirmed" ? <Button text="Abholung abgeschlossen" tone="positive" disabled={updating} onClick={() => void updateRequest("complete-order")}/> : selected.entry.status === "completed" && !selected.entry.archiveVerifiedAt ? <Button text="Nachweis separat archiviert" tone="positive" disabled={updating} onClick={() => void updateRequest("archive-order")}/> : null}
      </>}
    </Stack></Card>}</Stack></div></main>
}

