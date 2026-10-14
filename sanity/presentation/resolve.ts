import {defineDocuments, defineLocations, type PresentationPluginOptions} from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {route: "/", type: "startPage"},
    {route: "/sortiment", type: "assortmentPage"},
    {route: "/ueber-uns", type: "aboutPage"},
    {route: "/kontakt", type: "contactPage"},
    {route: "/diese-woche", type: "weeklyProduceList"},
  ]),
  locations: {
    startPage: defineLocations({select: {}, resolve: () => ({locations: [{title: "Startseite", href: "/"}]})}),
    storeIntroSettings: defineLocations({select: {}, resolve: () => ({locations: [{title: "Ein Laden mit Herz", href: "/"}]})}),
    assortmentPage: defineLocations({select: {}, resolve: () => ({locations: [{title: "Unser Sortiment", href: "/sortiment"}]})}),
    aboutPage: defineLocations({select: {}, resolve: () => ({locations: [{title: "Über uns", href: "/ueber-uns"}]})}),
    contactPage: defineLocations({select: {}, resolve: () => ({locations: [{title: "Kontakt & Anfahrt", href: "/kontakt"}]})}),
    weeklyOverview: defineLocations({select: {internalTitle: "internalTitle", week: "week", year: "year"}, resolve: (document) => ({locations: [{title: document?.internalTitle || `KW ${document?.week ?? "?"}/${document?.year ?? "?"}`, href: "/diese-woche"}]})}),
    weeklyProduceList: defineLocations({select: {title: "title", week: "week", year: "year"}, resolve: (document) => ({locations: [{title: document?.title || `KW ${document?.week ?? "?"}/${document?.year ?? "?"}`, href: "/diese-woche"}]})}),
    weeklyPageSettings: defineLocations({select: {}, resolve: () => ({locations: [{title: "Seitentexte: Diese Woche", href: "/diese-woche"}]})}),
    nextWeekPreview: defineLocations({select: {}, resolve: () => ({locations: [{title: "Nächste Woche", href: "/diese-woche"}]})}),
    assortmentEdition: defineLocations({select: {internalTitle: "internalTitle"}, resolve: (document) => ({locations: [{title: document?.internalTitle || "Sortimentsausgabe", href: "/"}, {title: "Unser Sortiment", href: "/sortiment"}]})}),
    assortmentCategory: defineLocations({select: {title: "title"}, resolve: (document) => ({locations: [{title: document?.title || "Sortimentskategorie", href: "/sortiment"}]})}),
    supplierBrand: defineLocations({select: {name: "name"}, resolve: (document) => ({locations: [{title: document?.name || "Marke", href: "/"}, {title: "Sortiment", href: "/sortiment"}]})}),
    businessSettings: defineLocations({select: {}, resolve: () => ({locations: [{title: "Kontakt & Öffnungszeiten", href: "/kontakt"}]})}),
    bakeryCatalog: defineLocations({select: {title: "title"}, resolve: (document) => ({locations: [{title: document?.title || "Backwarensortiment", href: "/diese-woche"}]})}),
    promotionSheet: defineLocations({select: {title: "title"}, resolve: (document) => ({locations: [{title: document?.title || "Aktionsblatt", href: "/diese-woche"}]})}),
  },
};
