const ghsFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

export function formatGhs(value: number | string): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return ghsFormatter.format(0);
  }
  return ghsFormatter.format(numericValue);
}
