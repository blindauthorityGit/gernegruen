"use client"

import {useEffect, useMemo, useState} from "react"
import {Button, Card, Flex, Heading, Spinner, Stack, Text, TextInput} from "@sanity/ui"

type Entry = {id: string; name?: string; email?: string; phone?: string; product?: string; description?: string; pickupDate?: string; products?: {name?: string; quantity?: number; unitPriceCents?: number}[]; totalCents?: number; message?: string; status?: string; internalNotes?: string; createdAt?: string}
type Data = {orders: Entry[]; wishes: Entry[]}
const statusLabels: Record<string,string> = {pending:"Neu",in_progress:"In Bearbeitung",completed:"Erledigt",cancelled:"Storniert",read:"Gelesen"}
const date = (value?: string) => value ? new Intl.DateTimeFormat("de-AT", {dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Vienna"}).format(new Date(value)) : "–"

export function OrdersDashboardTool() {
  const [data, setData] = useState<Data>({orders:[],wishes:[]})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{type:"order"|"wish"; entry:Entry}|null>(null)
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/studio/requests", {signal:controller.signal}).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Anfragen konnten nicht geladen werden.")
      setData(result)
    }).catch(reason => {if (reason.name !== "AbortError") setError(reason.message)}).finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("de-AT")
    const match = (entry:Entry) => !needle || [entry.id,entry.name,entry.product,entry.description,...(entry.products ?? []).map(item=>item.name)].some(value=>value?.toLocaleLowerCase("de-AT").includes(needle))
    return {orders:data.orders.filter(match), wishes:data.wishes.filter(match)}
  },[data,search])
  const recent = Date.now()-30*24*60*60*1000
  const done = [...data.orders,...data.wishes].filter(entry=>entry.status==="completed"&&entry.createdAt&&new Date(entry.createdAt).getTime()>=recent).length
  const fresh = (entry:Entry) => !entry.status || entry.status==="pending"

  async function save() {
    if (!selected) return
    setSaving(true); setError("")
    try {
      const response=await fetch("/api/studio/requests",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:selected.type,id:selected.entry.id,status,internalNotes:notes})})
      const result=await response.json(); if(!response.ok) throw new Error(result.message||"Änderung konnte nicht gespeichert werden.")
      setData(current=>{const key=selected.type==="order"?"orders":"wishes";return {...current,[key]:current[key].map(item=>item.id===selected.entry.id?{...item,status,internalNotes:notes}:item)} as Data}); setSelected(null)
    } catch(reason) {setError(reason instanceof Error?reason.message:"Änderung konnte nicht gespeichert werden.")} finally {setSaving(false)}
  }

  function open(type:"order"|"wish", entry:Entry) {setSelected({type,entry});setStatus(entry.status??"pending");setNotes(entry.internalNotes??"")}
  const count = (items:Entry[]) => items.filter(fresh).length
  const list = (type:"order"|"wish", items:Entry[]) => <Card padding={4} border radius={2}><Stack space={3}><Heading size={2}>{type==="order"?"Backwaren-Bestellungen":"Kundenwünsche"}</Heading>{items.length===0?<Text muted>Keine passenden Anfragen.</Text>:<div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%",minWidth:720,textAlign:"left"}}><thead><tr>{["Eingang","Kunde",...(type==="order"?["Abholung","Artikel","Gesamtpreis"]:["Kontakt","Wunsch"]),"Status",""].map(label=><th key={label} style={{padding:"12px 10px",borderBottom:"1px solid #ddd"}}>{label}</th>)}</tr></thead><tbody>{items.map(entry=><tr key={entry.id} style={{background:fresh(entry)?"rgba(48,129,95,.07)":undefined}}><td style={{padding:10,whiteSpace:"nowrap"}}>{date(entry.createdAt)}</td><td style={{padding:10}}>{entry.name||"Nicht angegeben"}</td>{type==="order"?<><td style={{padding:10}}>{entry.pickupDate||"–"}</td><td style={{padding:10}}>{entry.products?.map(item=>`${item.quantity??1}× ${item.name}`).join(", ")||"–"}</td><td style={{padding:10,whiteSpace:"nowrap"}}>{typeof entry.totalCents==="number"?new Intl.NumberFormat("de-AT",{style:"currency",currency:"EUR"}).format(entry.totalCents/100):"–"}</td></>:<><td style={{padding:10}}>{entry.email||"–"}</td><td style={{padding:10}}>{entry.product||entry.description||"–"}</td></>}<td style={{padding:10}}>{fresh(entry)?"Neu":statusLabels[entry.status??""]??entry.status}</td><td style={{padding:10}}><Button mode="ghost" text="Details" onClick={()=>open(type,entry)}/></td></tr>)}</tbody></table></div>}</Stack></Card>

  if(loading)return <Flex align="center" justify="center" padding={6} gap={3}><Spinner/><Text>Lade Anfragen …</Text></Flex>
  return <div style={{padding:"clamp(16px,3vw,36px)",maxWidth:1600,margin:"0 auto"}}><Stack space={5}><Stack space={2}><Heading size={3}>Bestellungen & Wünsche</Heading><Text muted>Neue Eingänge im Blick behalten und Anfragen bearbeiten.</Text></Stack>
    {error&&<Card padding={4} tone="caution" border><Stack space={2}><Text weight="semibold">Dashboard nicht verfügbar</Text><Text>{error}</Text>{error.includes("Admin-Zugriff")&&<Text muted>Für den geschützten Zugriff muss zuerst die Firebase-Admin-Anmeldung eingerichtet werden. Bis dahin bleiben Kundendaten gesperrt.</Text>}</Stack></Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>{[["Neue Bestellungen",count(data.orders)],["Offene Bestellungen",data.orders.filter(item=>!["completed","cancelled"].includes(item.status??"")).length],["Neue Kundenwünsche",count(data.wishes)],["Erledigt · 30 Tage",done]].map(([label,value])=><Card key={label} padding={4} border radius={2}><Stack space={2}><Text muted>{label}</Text><Heading size={3}>{value}</Heading></Stack></Card>)}</div>
    <TextInput aria-label="Suche" placeholder="Name, Bestellnummer oder Produkt suchen" value={search} onChange={event=>setSearch(event.currentTarget.value)}/>{list("order",filtered.orders)}{list("wish",filtered.wishes)}
    {selected&&<Card padding={4} border radius={2}><Stack space={4}><Flex justify="space-between" align="center"><Heading size={2}>{selected.type==="order"?"Bestellung":"Kundenwunsch"} · {selected.entry.id}</Heading><Button text="Schließen" mode="ghost" onClick={()=>setSelected(null)}/></Flex><Text>{date(selected.entry.createdAt)} · {selected.entry.name||"Name nicht angegeben"} · {selected.entry.email||"Keine E-Mail"} {selected.entry.phone||""}</Text>{selected.type==="order"?<><Text>Abholung: {selected.entry.pickupDate||"–"}</Text><Stack space={2}>{(selected.entry.products??[]).map((item,index)=><Text key={`${item.name}-${index}`}>{item.quantity??1} × {item.name} · {((item.unitPriceCents??0)/100).toLocaleString("de-AT",{style:"currency",currency:"EUR"})}</Text>)}</Stack><Text>Gesamt: {((selected.entry.totalCents??0)/100).toLocaleString("de-AT",{style:"currency",currency:"EUR"})}</Text><Text>{selected.entry.message||"Keine Kundenanmerkung"}</Text></>:<Text>{selected.entry.product}{selected.entry.description?` — ${selected.entry.description}`:""}</Text>}<label>Status<select aria-label="Status" value={status} onChange={event=>setStatus(event.currentTarget.value)} style={{display:"block",padding:10,marginTop:6}}>{(selected.type==="order"?["pending","in_progress","completed","cancelled"]:["pending","read","completed"]).map(value=><option key={value} value={value}>{statusLabels[value]}</option>)}</select></label><label>Interne Notiz<textarea aria-label="Interne Notiz" maxLength={5000} rows={4} value={notes} onChange={event=>setNotes(event.currentTarget.value)} style={{display:"block",width:"100%",padding:10,marginTop:6}}/></label><Flex justify="flex-end"><Button text={saving?"Speichere …":"Änderungen speichern"} tone="primary" disabled={saving} onClick={()=>void save()}/></Flex></Stack></Card>}</Stack></div>
}
