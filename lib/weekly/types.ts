export type ProduceGroup = {
  _key: string;
  title: string;
  items: Array<{_key: string; name: string; note?: string}>;
};

export type WeeklyHighlight = {
  _key?: string;
  title: string;
  name: string;
  description?: string;
  price?: string | number;
  image: {src: string; alt: string};
};

export type BakeryProduct = {
  _key: string;
  name: string;
  price: string | number;
  note?: string;
  ingredients?: string;
};

export type BakeryCategory = {
  _key: string;
  title: string;
  products: BakeryProduct[];
};

export type BakeryCatalogData = {
  _id: string;
  breadCategories?: BakeryCategory[];
  sweetCategories?: BakeryCategory[];
};
