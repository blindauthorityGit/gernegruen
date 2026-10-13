export function formatEuroPrice(price: string | number) {
  if (typeof price === "string") return price;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price);
}
