import type {OpeningHoursDay, OpeningHoursException} from "@/sanity/types/business";
import {stegaClean} from "next-sanity";

export function getBerlinDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getBerlinWeekdayIndex(date = new Date()) {
  const dateKey = getBerlinDateKey(date);
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay() || 7;
}

export function addBerlinCalendarDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

export function getOpeningHoursForDate(openingHours: OpeningHoursDay[], exceptions: OpeningHoursException[] = [], dateKey = getBerlinDateKey()) {
  const weekdayNumber = new Date(`${dateKey}T12:00:00Z`).getUTCDay() || 7;
  const regular = openingHours.find((entry) => entry.dayOfWeek === weekdayNumber);
  const exception = exceptions.find((entry) => stegaClean(entry.date) === dateKey);
  if (!regular) return null;
  if (!exception) return {...regular, label: undefined};
  return {
    ...regular,
    isClosed: exception.isClosed ?? regular.isClosed,
    opens: exception.opens ?? regular.opens,
    closes: exception.closes ?? regular.closes,
    label: exception.label,
  };
}

export function formatOpeningHours(entry: (OpeningHoursDay & {label?: string}) | null | undefined) {
  if (!entry || entry.isClosed || !entry.opens || !entry.closes) return "geschlossen";
  return `${entry.opens}–${entry.closes} Uhr`;
}

export function getOpeningStatus(entry: ReturnType<typeof getOpeningHoursForDate>, now = new Date()) {
  if (!entry || entry.isClosed || !entry.opens || !entry.closes) return {isOpen: false, label: "Heute geschlossen"};
  const parts = new Intl.DateTimeFormat("en-GB", {timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(now);
  const currentMinutes = Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const opens = entry.opens.split(":").map(Number);
  const closes = entry.closes.split(":").map(Number);
  const openingMinutes = opens[0] * 60 + opens[1];
  const closingMinutes = closes[0] * 60 + closes[1];
  return currentMinutes >= openingMinutes && currentMinutes < closingMinutes
    ? {isOpen: true, label: `Heute geöffnet bis ${entry.closes} Uhr`}
    : {isOpen: false, label: "Heute geschlossen"};
}
