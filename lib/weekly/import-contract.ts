import type { BakeryCategory, ProduceGroup } from "./types";

export type WeeklyProduceImport = {
  sourceFileName: string;
  week: number;
  year: number;
  groups: ProduceGroup[];
};

export type BakeryCatalogImport = {
  sourceFileName: string;
  categories: BakeryCategory[];
};

export type ImportValidationIssue = {
  row?: number;
  field?: string;
  message: string;
};

export type ImportResult<T> =
  | { ok: true; data: T; warnings: ImportValidationIssue[] }
  | { ok: false; errors: ImportValidationIssue[] };

// Excel adapters will implement these contracts in a server-only import route.
// Keeping the normalized shape here prevents spreadsheet concerns leaking into React.
