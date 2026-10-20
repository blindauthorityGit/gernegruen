import "server-only";

import Holidays from "date-holidays";
import {getMinimumPickupDateByCutoff, getTodayInDreieich, isPickupDateBeforeCutoff} from "@/lib/preorder/deadlines";

const TIME_ZONE = "Europe/Berlin";
const holidays = new Holidays("DE", "HE", { languages: "de", timezone: TIME_ZONE, types: ["public"] });

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getMinimumPickupDate(now = new Date()) {
  const today = getTodayInDreieich(now);
  const excludedDates = getHolidayDates(new Date(`${today}T12:00:00Z`).getUTCFullYear(), new Date(`${today}T12:00:00Z`).getUTCFullYear() + 2);
  return getMinimumPickupDateByCutoff(now, excludedDates);
}

export function getHolidayDates(startYear: number, endYear: number) {
  const dates = new Set<string>();
  for (let year = startYear; year <= endYear; year += 1) {
    for (const holiday of holidays.getHolidays(year, "de")) {
      if (holiday.type === "public") dates.add(holiday.date.slice(0, 10));
    }
  }
  return [...dates].sort();
}

export function isValidPickupDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  if (value <= getTodayInDreieich(now)) return false;
  if (parsed.getUTCDay() === 0) return false;
  if (getHolidayDates(parsed.getUTCFullYear(), parsed.getUTCFullYear()).includes(value)) return false;
  return isPickupDateBeforeCutoff(value, now);
}

export function getPickupAvailability(now = new Date(), monthsAhead = 18) {
  const minimumDate = getMinimumPickupDate(now);
  const start = new Date(`${minimumDate}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + monthsAhead);
  const maximumDate = end.toISOString().slice(0, 10);
  const holidayDates = getHolidayDates(start.getUTCFullYear(), end.getUTCFullYear())
    .filter((date) => date >= minimumDate && date <= maximumDate);

  let suggestedDate = minimumDate;
  while (!isValidPickupDate(suggestedDate, now)) suggestedDate = addDays(suggestedDate, 1);

  return { minimumDate, maximumDate, suggestedDate, holidayDates };
}
