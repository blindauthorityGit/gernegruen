import type { OrderableBakeryProduct } from "./products";

function normalize(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function editDistanceWithin(left: string, right: string, limit: number) {
  if (Math.abs(left.length - right.length) > limit) return false;
  let previous = Array.from({length: right.length + 1}, (_, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      const distance = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + cost,
      );
      current[column] = distance;
      rowMinimum = Math.min(rowMinimum, distance);
    }
    if (rowMinimum > limit) return false;
    previous = current;
  }

  return previous[right.length] <= limit;
}

function matchesToken(query: string, candidate: string) {
  if (candidate.includes(query)) return true;
  if (query.length < 4) return false;
  const tolerance = query.length >= 9 ? 2 : 1;
  return editDistanceWithin(query, candidate, tolerance);
}

function matchesInsideCompound(query: string, candidates: string) {
  if (candidates.includes(query)) return true;
  if (query.length < 5 || query.length > 32) return false;
  const tolerance = query.length >= 9 ? 2 : 1;
  for (let start = 0; start < candidates.length; start += 1) {
    for (let length = Math.max(1, query.length - tolerance); length <= query.length + tolerance; length += 1) {
      const candidate = candidates.slice(start, start + length);
      if (candidate.length === length && editDistanceWithin(query, candidate, tolerance)) return true;
    }
  }
  return false;
}

export function matchesBakerySearch(query: string, product: OrderableBakeryProduct, categoryTitle: string, sectionTitle: string) {
  const queryTokens = normalize(query).split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return true;

  const candidates = normalize(`${product.name} ${product.note ?? ""} ${product.ingredients ?? ""} ${categoryTitle} ${sectionTitle}`)
    .split(/\s+/)
    .filter(Boolean);
  const compoundCandidates = candidates.join("");
  return queryTokens.every((queryToken) => candidates.some((candidate) => matchesToken(queryToken, candidate)) || matchesInsideCompound(queryToken, compoundCandidates));
}
