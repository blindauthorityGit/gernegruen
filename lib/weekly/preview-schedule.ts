const VIENNA_TIME_ZONE = "Europe/Vienna"
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

type DateParts = {year: number; month: number; day: number}

const viennaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VIENNA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const viennaDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VIENNA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function partsRecord(parts: Intl.DateTimeFormatPart[]) {
  return Object.fromEntries(parts.filter(({type}) => type !== "literal").map(({type, value}) => [type, Number(value)]))
}

function parseIsoDate(value: string): DateParts | null {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return null
  const parts = {year: Number(match[1]), month: Number(match[2]), day: Number(match[3])}
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  return check.getUTCFullYear() === parts.year && check.getUTCMonth() === parts.month - 1 && check.getUTCDate() === parts.day
    ? parts
    : null
}

function formatIsoDate({year, month, day}: DateParts) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function addCalendarDays(value: string, days: number) {
  const parts = parseIsoDate(value)
  if (!parts) return null
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return formatIsoDate({year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()})
}

function localMidnightToUtc(value: string) {
  const parts = parseIsoDate(value)
  if (!parts) return null

  const desired = Date.UTC(parts.year, parts.month - 1, parts.day)
  let candidate = desired

  for (let pass = 0; pass < 2; pass += 1) {
    const displayed = partsRecord(viennaDateTimeFormatter.formatToParts(new Date(candidate)))
    const displayedAsUtc = Date.UTC(displayed.year, displayed.month - 1, displayed.day, displayed.hour, displayed.minute, displayed.second)
    candidate += desired - displayedAsUtc
  }

  return new Date(candidate)
}

export function getUpcomingMonday(now = new Date()) {
  const local = partsRecord(viennaDateFormatter.formatToParts(now))
  const localDate = formatIsoDate({year: local.year, month: local.month, day: local.day})
  const weekday = new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay()
  return addCalendarDays(localDate, ((8 - weekday) % 7) || 7)!
}

export function getPreviewWindow(offerWeek: string, publicationDate?: string | null) {
  const monday = parseIsoDate(offerWeek)
  if (!monday || new Date(Date.UTC(monday.year, monday.month - 1, monday.day)).getUTCDay() !== 1) return null

  const thursday = addCalendarDays(offerWeek, -4)
  const defaultStart = thursday ? localMidnightToUtc(thursday) : null
  const end = localMidnightToUtc(offerWeek)
  if (!defaultStart || !end) return null

  let start = defaultStart
  if (publicationDate) {
    const published = new Date(publicationDate)
    if (Number.isNaN(published.valueOf())) return null
    if (published > start) start = published
  }

  return start < end ? {start, end} : null
}

export function isPreviewVisible(offerWeek: string, publicationDate: string | null | undefined, now = new Date()) {
  const window = getPreviewWindow(offerWeek, publicationDate)
  return Boolean(window && now >= window.start && now < window.end)
}
