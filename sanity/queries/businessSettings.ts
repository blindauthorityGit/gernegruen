import {defineQuery} from "next-sanity";

export const BUSINESS_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "businessSettings" && _type == "businessSettings"][0] {
    businessName, street, postalCode, city, phone, email, instagramHandle, legalSeo,
    coordinates {latitude, longitude},
    openingHours[] | order(dayOfWeek asc) {_key, dayOfWeek, day, shortDay, isClosed, opens, closes},
    exceptions[] {_key, date, label, isClosed, opens, closes}
  }
`);
