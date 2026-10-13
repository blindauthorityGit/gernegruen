export type OpeningHoursDay = {
  dayOfWeek: number;
  day: string;
  shortDay: string;
  isClosed?: boolean;
  opens?: string;
  closes?: string;
};

export type OpeningHoursException = {
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
  phone: string;
  email: string;
  instagramHandle?: string;
  coordinates: {latitude: number; longitude: number};
  openingHours: OpeningHoursDay[];
  exceptions?: OpeningHoursException[];
} | null;
