import {defineQuery} from "next-sanity";

export const FOOTER_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "footerSettings" && _type == "footerSettings"][0] {
    openingHoursHeading,
    addressHeading,
    linksHeading,
    legalLinks[]{_key, label, href}
  }
`);
