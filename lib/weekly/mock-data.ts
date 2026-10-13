import type { WeeklyPageData } from "./types";

export const weeklyPageFallback: WeeklyPageData = {
  week: 42,
  year: 2026,
  dateRange: "12.–18. Oktober 2026",
  produceGroups: [
    {
      _key: "fruit",
      title: "Obst",
      items: [
        { _key: "apples", name: "Äpfel" },
        { _key: "pears", name: "Birnen" },
        { _key: "grapes", name: "Trauben, hell und rot" },
        { _key: "plums", name: "Zwetschgen" },
        { _key: "lemons", name: "Zitronen" },
        { _key: "bananas", name: "Bananen" },
      ],
    },
    {
      _key: "vegetables",
      title: "Gemüse",
      items: [
        { _key: "pumpkin", name: "Hokkaido-Kürbis" },
        { _key: "potatoes", name: "Kartoffeln" },
        { _key: "carrots", name: "Möhren" },
        { _key: "leek", name: "Lauch" },
        { _key: "broccoli", name: "Brokkoli" },
        { _key: "salad", name: "Blattsalat" },
        { _key: "tomatoes", name: "Tomaten" },
        { _key: "zucchini", name: "Zucchini" },
      ],
    },
  ],
  bakeryHighlights: [
    {
      title: "Brot der Woche",
      name: "Kartoffelbrot",
      description: "Saftig, herzhaft und lange frisch – ein kräftiges Brot für Frühstück und Abendbrot.",
      price: "4,10 €",
      image: { src: "/graphics/weekly-bread-illustration.png", alt: "Flache Illustration eines Brots" },
    },
    {
      title: "Kuchen der Woche",
      name: "Dinkel-Schoko-Bananen-Kuchen",
      description: "Locker gebacken mit Dinkel, Banane und feinen Schokostückchen.",
      image: { src: "/graphics/weekly-cake-illustration.png", alt: "Flache Illustration eines Kuchens" },
    },
  ],
  bakeryCategories: [
    {
      _key: "wholegrain-rolls", title: "Vollkornbrötchen & -stangen", products: [
        { _key: "1", name: "Glattes Brötchen", price: "0,85 €" },
        { _key: "2", name: "Mohnbrötchen", price: "0,90 €" },
        { _key: "3", name: "Sesambrötchen", price: "0,90 €" },
        { _key: "4", name: "Sonnenblumenkernbrötchen", price: "0,90 €" },
        { _key: "6", name: "Käsebrötchen", price: "0,90 €" },
        { _key: "7", name: "Mohnstange", price: "1,25 €" },
        { _key: "8", name: "Sesamstange", price: "1,25 €" },
        { _key: "9", name: "Kümmelstange", price: "1,25 €" },
        { _key: "10", name: "Mehrkornstange", price: "2,00 €" },
        { _key: "11", name: "Roggen-Brötchen", price: "1,60 €" },
        { _key: "13", name: "Kürbiskernbrötchen", price: "0,90 €" },
        { _key: "14", name: "Partybrötchen", price: "0,70 €" },
      ],
    },
    {
      _key: "light-rolls", title: "Helle Brötchen", products: [
        { _key: "20", name: "Große Spitze", price: "0,85 €" },
        { _key: "21", name: "Kleine Spitze", price: "0,40 €" },
        { _key: "22", name: "Krusti", price: "0,95 €" },
        { _key: "27", name: "Kümmelbrötchen", price: "0,90 €" },
        { _key: "28", name: "Doppeltes Wasserbrötchen", price: "0,90 €" },
        { _key: "29", name: "Milchbrötchen", price: "0,85 €" },
        { _key: "74", name: "Partybrötchen", price: "0,70 €" },
      ],
    },
    {
      _key: "spelt-rolls", title: "Dinkelbrötchen", products: [
        { _key: "38", name: "Dinkel-Emmer-Brötchen mit Grüntee", price: "1,45 €" },
        { _key: "39", name: "Dinkel-Vollkorn-Brötchen mit Chia", price: "1,45 €" },
        { _key: "40", name: "Dinkel-Vollkorn-Brötchen", price: "1,70 €" },
        { _key: "41", name: "Dinkel-Vollkorn-Stange", price: "2,99 €" },
        { _key: "42", name: "Dinkel-Rosenbrötchen", price: "1,20 €" },
        { _key: "43", name: "Dinkel-Vollkorn-Brötchen mit Walnüssen", price: "1,45 €" },
        { _key: "45", name: "Dinkelbrötchen mit Früchten", price: "1,95 €" },
        { _key: "47", name: "Dinkel-Rosinenbrötchen", price: "1,90 €" },
      ],
    },
    {
      _key: "pretzel", title: "Laugengebäck", products: [
        { _key: "60", name: "Laugenbrezel", price: "1,70 €" },
        { _key: "61", name: "Laugenbrötchen", price: "1,60 €" },
        { _key: "62", name: "Laugenstange", price: "1,60 €" },
        { _key: "63", name: "Laugen-Käse-Stange", price: "2,10 €" },
        { _key: "64", name: "Laugencroissant", price: "2,10 €" },
        { _key: "65", name: "Laugenbaguette (250 g)", price: "3,80 €" },
      ],
    },
    {
      _key: "sourdough", title: "Sauerteig- & Roggenbrote", products: [
        { _key: "110", name: "Sauerteigbrot (O, 1.000 g)", price: "6,10 €" },
        { _key: "112", name: "Sauerteigbrot (lang, 1.000 g)", price: "6,10 €" },
        { _key: "113", name: "Kümmel-Sauerteigbrot (1.000 g)", price: "6,20 €" },
        { _key: "114", name: "Sauerteigbrot (O, 750 g)", price: "5,20 €" },
        { _key: "116", name: "Ganzkornbrot (Kasten, 750 g)", price: "5,70 €" },
        { _key: "117", name: "Kürbiskernbrot (Kasten, 750 g)", price: "6,10 €" },
        { _key: "118", name: "Sesambrot (Kasten, 750 g)", price: "6,00 €" },
      ],
    },
    {
      _key: "spelt-bread", title: "Dinkelbrote", products: [
        { _key: "130", name: "Dinkel-Hafer-Brot mit Leinsamen", price: "5,70 €" },
        { _key: "131", name: "Dinkel-Chia-Brot (Kasten, 500 g)", price: "5,70 €" },
        { _key: "132", name: "Dinkel-Flocken-Brot (O, 500 g)", price: "5,70 €" },
        { _key: "135", name: "Dinkelbrot (Kasten, 1.000 g)", price: "6,90 €" },
        { _key: "136", name: "Dinkelbrot (lang, 750 g)", price: "6,00 €" },
        { _key: "137", name: "Dinkel-Mandel-Cashewkern-Brot (500 g)", price: "5,70 €" },
        { _key: "138", name: "Sonnenblumen-Kürbis-Brot (1.000 g)", price: "7,50 €" },
        { _key: "139", name: "Energiebrot (Kasten, 500 g)", price: "5,70 €" },
      ],
    },
    {
      _key: "wheat-bread", title: "Weizen- & Mischbrote", products: [
        { _key: "100", name: "Roggen-Weizen-Brot (Kasten, 1.000 g)", price: "6,00 €" },
        { _key: "102", name: "Roggen-Weizen-Brot (lang, 750 g)", price: "4,70 €" },
        { _key: "105", name: "Sonnenblumenkernbrot (Kasten, 1.000 g)", price: "6,20 €" },
        { _key: "106", name: "Walnussbrot (Kasten, 750 g)", price: "6,20 €" },
        { _key: "141", name: "Vollkorn-Baguette (500 g)", price: "4,40 €" },
        { _key: "147", name: "Fladenbrot (250 g)", price: "3,80 €" },
        { _key: "151", name: "Baguette (500 g)", price: "4,00 €" },
        { _key: "154", name: "Kasten-Weißbrot (500 g)", price: "4,00 €" },
      ],
    },
    {
      _key: "sweet", title: "Kuchen & süße Backwaren", products: [
        { _key: "s1", name: "Obstkuchen der Saison", price: "ab 3,20 €", note: "Stück" },
        { _key: "s2", name: "Dinkel-Schoko-Bananen-Kuchen", price: "ab 3,20 €", note: "Stück" },
        { _key: "s3", name: "Mohnkuchen", price: "ab 3,20 €", note: "Stück" },
        { _key: "s4", name: "Käsekuchen", price: "ab 3,20 €", note: "Stück" },
      ],
    },
  ],
  promotionSheet: {
    title: "Aktionsblatt ansehen",
    description: "Das beigefügte Blatt zeigt beispielhaft, wie Angebote künftig direkt auf dieser Seite erscheinen.",
    validLabel: "Beispiel-Aktionsblatt · August 2026",
    pdfUrl: "/documents/aktionsblatt-august-2026.pdf",
  },
};
