export function formatOrderNumber(n: number): string {
  return `DS-${String(n).padStart(4, "0")}`;
}
