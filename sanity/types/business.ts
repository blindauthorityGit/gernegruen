export type OpeningHoursDay = {
  _key?: string;
  dayOfWeek: number;
  day: string;
  shortDay: string;
  isClosed?: boolean;
  opens?: string;
  closes?: string;
};

export type OpeningHoursException = {
  _key?: string;
  date: string;
  label?: string;
  isClosed?: boolean;
  opens?: string;
  closes?: string;
};

export type BusinessSettings = {
  businessName: string;
  street: string;
  postalCode: string;
  city: string;
  legalName?: string;
  authorizedRepresentatives?: { _key?: string; fullName: string; role?: string }[];
  representationNote?: string;
  registerCourt?: string;
  registerNumber?: string;
  vatId?: string;
  organicCertification?: string;
  organicControlBody?: string;
  phone: string;
  email: string;
  instagramHandle?: string;
  legalSeo?: {imprintTitle?: string; imprintDescription?: string; privacyTitle?: string; privacyDescription?: string; accessibilityTitle?: string; accessibilityDescription?: string};
  coordinates: {latitude: number; longitude: number};
  openingHours: OpeningHoursDay[];
  exceptions?: OpeningHoursException[];
} | null;
