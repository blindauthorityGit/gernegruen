import {contentCategory} from "./documents/contentCategory"
import {highlightItem} from "./documents/highlightItem"
import {startPage} from "./documents/startPage"
import {contentCardSection} from "./objects/contentCardSection"
import {startHero} from "./objects/startHero"
import {storeCategory, storeIntroHighlight, storeIntroSection} from "./objects/storeIntroSection"
import {contentLink} from "./objects/contentLink"
import {assortmentCard, assortmentEntry} from "./objects/assortmentCard"
import {assortmentEdition} from "./documents/assortmentEdition"
import {bakeryCatalog} from "./documents/bakeryCatalog"
import {promotionSheet} from "./documents/promotionSheet"
import {weeklyOverview} from "./documents/weeklyOverview"
import {bakeryCategory, bakeryProduct} from "./objects/bakeryCategory"
import {weeklyBakeryHighlight} from "./objects/weeklyBakeryHighlight"
import {weeklyProduceGroup, weeklyProduceItem} from "./objects/weeklyProduceGroup"
import {nextWeekProduct} from "./objects/nextWeekProduct"
import {nextWeekPreview} from "./documents/nextWeekPreview"
import {supplierBrand} from "./documents/supplierBrand"
import {assortmentCategory} from "./documents/assortmentCategory"
import {assortmentPage} from "./documents/assortmentPage"
import {aboutPage} from "./documents/aboutPage"
import {businessSettings} from "./documents/businessSettings"
import {contactPage} from "./documents/contactPage"
import {weeklyProduceList} from "./documents/weeklyProduceList"
import {weeklyProduceImportProduct} from "./objects/weeklyProduceImportProduct"

export const schemaTypes = [
  startPage,
  highlightItem,
  contentCategory,
  startHero,
  storeIntroSection,
  storeIntroHighlight,
  storeCategory,
  contentCardSection,
  contentLink,
  assortmentCard,
  assortmentEntry,
  assortmentEdition,
  weeklyProduceItem,
  weeklyProduceGroup,
  weeklyBakeryHighlight,
  bakeryProduct,
  bakeryCategory,
  bakeryCatalog,
  promotionSheet,
  weeklyOverview,
  nextWeekProduct,
  nextWeekPreview,
  supplierBrand,
  assortmentCategory,
  assortmentPage,
  aboutPage,
  businessSettings,
  contactPage,
  weeklyProduceList,
  weeklyProduceImportProduct,
]
