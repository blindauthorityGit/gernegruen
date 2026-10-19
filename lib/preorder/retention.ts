const DAY_MS = 24 * 60 * 60 * 1000;

function timestampDate(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && Number.isFinite(date.getTime()) ? date : null;
  }
  return null;
}

function addCalendarMonths(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const result = new Date(Date.UTC(year, month, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function productWishExpiresAt(createdAt: Date, lastSubstantiveActivityAt = createdAt) {
  const inactivityLimit = new Date(lastSubstantiveActivityAt.getTime() + 180 * DAY_MS);
  const maximumLifetime = addCalendarMonths(createdAt, 12);
  return inactivityLimit < maximumLifetime ? inactivityLimit : maximumLifetime;
}

export function unconfirmedOrderExpiresAt(pickupDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) return null;
  const pickup = new Date(`${pickupDate}T00:00:00.000Z`);
  if (!Number.isFinite(pickup.getTime()) || pickup.toISOString().slice(0, 10) !== pickupDate) return null;
  return new Date(pickup.getTime() + 90 * DAY_MS);
}

export function orderExpiresAt(data: Record<string, unknown>) {
  const status = typeof data.status === "string" ? data.status : "pending";
  if (["pending", "in_progress", "cancelled"].includes(status)) {
    return typeof data.pickupDate === "string" ? unconfirmedOrderExpiresAt(data.pickupDate) : null;
  }

  if (status === "completed" && data.archiveVerifiedAt) {
    const completedAt = timestampDate(data.completedAt);
    return completedAt ? new Date(completedAt.getTime() + 90 * DAY_MS) : null;
  }

  return null;
}

export function effectiveExpiry(collectionType: "order" | "wish", data: Record<string, unknown>) {
  const explicit = timestampDate(data.expiresAt);
  if (explicit) return explicit;
  if (data.expiresAt === null) return null;

  if (collectionType === "wish") {
    const createdAt = timestampDate(data.createdAt);
    if (!createdAt) return null;
    const lastActivity = timestampDate(data.lastSubstantiveActivityAt) ?? createdAt;
    return productWishExpiresAt(createdAt, lastActivity);
  }

  return orderExpiresAt(data);
}
