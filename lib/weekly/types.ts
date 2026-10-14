export type ProduceGroup = {
  _key: string;
  title: string;
  items: Array<{ _key: string; name: string; note?: string }>;
};

export type WeeklyHighlight = {
  _key?: string;
  title: string;
  name: string;
  description: string;
  price?: string | number;
  image: { src: string; alt: string };
};

export type BakeryProduct = {
  _key: string;
  name: string;
  price: string | number;
  note?: string;
};

export type BakeryCategory = {
  _key: string;
  title: string;
  products: BakeryProduct[];
};

export type PromotionSheet = {
  _id?: string;
  title: string;
  description?: string;
  validLabel: string;
  pdfUrl?: string;
};

export type WeeklyPageData = {
  _id?: string;
  _type?: "weeklyOverview";
  week: number;
  year: number;
  dateRange: string;
  produceGroups: ProduceGroup[];
  bakeryHighlights: WeeklyHighlight[];
  bakeryCategories: BakeryCategory[];
  bakeryCatalogId?: string;
  promotionSheets: PromotionSheet[];
  promotionSheet: PromotionSheet | null;
};
