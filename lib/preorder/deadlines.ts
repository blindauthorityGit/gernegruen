const TIME_ZONE = "Europe/Berlin";

function berlinDateTimeKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function orderDeadlineForPickupDate(pickupDate: string) {
  const pickup = new Date(`${pickupDate}T12:00:00Z`);
  const daysBefore = pickup.getUTCDay() === 1 ? 2 : 1;
  const orderDate = addDays(pickupDate, -daysBefore);
  const orderWeekday = new Date(`${orderDate}T12:00:00Z`).getUTCDay();
  const cutoffHour = orderWeekday === 3 ? 13 : orderWeekday === 6 ? 12 : 16;
  return `${orderDate}T${String(cutoffHour).padStart(2, "0")}:00:00.000`;
}

export function getTodayInDreieich(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getMinimumPickupDateByCutoff(now = new Date(), excludedDates: string[] = []) {
  const today = getTodayInDreieich(now);
  const currentTime = berlinDateTimeKey(now);
  const excluded = new Set(excludedDates);
  let candidate = addDays(today, 1);

  for (let day = 0; day < 550; day += 1) {
    const weekday = new Date(`${candidate}T12:00:00Z`).getUTCDay();
    if (weekday !== 0 && !excluded.has(candidate) && currentTime <= orderDeadlineForPickupDate(candidate)) return candidate;
    candidate = addDays(candidate, 1);
  }
  return addDays(today, 1);
}

export function isPickupDateBeforeCutoff(value: string, now = new Date()) {
  return berlinDateTimeKey(now) <= orderDeadlineForPickupDate(value);
}
