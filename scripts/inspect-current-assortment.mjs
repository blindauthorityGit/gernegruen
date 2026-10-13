import nextEnv from "@next/env"
import {createClient} from "next-sanity"
nextEnv.loadEnvConfig(process.cwd())
const client=createClient({projectId:"zqaggz4f",dataset:"production",apiVersion:"2026-09-17",token:process.env.SANITY_API_READ_TOKEN||process.env.SANITY_API_TOKEN,useCdn:false}).withConfig({perspective:"published"})
const doc=await client.fetch(`*[_id == "startPage"][0]{_id, "editions":assortmentSection.editions[]->{_id, internalTitle, startAt, endAt, isEnabled, cards[]{_key, title, marker, intro, entries[]{title, description}, cta}}}`)
console.log(JSON.stringify(doc,null,2))
