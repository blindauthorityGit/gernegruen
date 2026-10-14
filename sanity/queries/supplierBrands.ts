import {defineQuery} from "next-sanity";

export const SUPPLIER_BRANDS_QUERY = defineQuery(/* groq */ `
  *[_type == "supplierBrand" && isVisible != false] | order(sortOrder asc, name asc) {
    _id, _type, name, description, url, sortOrder,
    "logoUrl": logo.asset->url
  }
`);
