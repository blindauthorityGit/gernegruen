import {defineQuery} from "next-sanity";

export const BUSINESS_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "businessSettings" && _type == "businessSettings"][0] {
    businessName, street, postalCode, city, phone, email, instagramHandle,
    coordinates {latitude, longitude},
    openingHours[] | order(dayOfWeek asc) {dayOfWeek, day, shortDay, isClosed, opens, closes},
    exceptions[] {date, label, isClosed, opens, closes}
  }
`);
