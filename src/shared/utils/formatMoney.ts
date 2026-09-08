// Formateo de montos. El backend devuelve los NUMERIC como string (nunca se
// hace aritmética en cliente). Locale es-VE: punto para miles, coma decimal.
// Devuelve "—" en null / NaN. Preserva el signo negativo (una cartera puede
// quedar en sobregiro por un ajuste).

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

function format(n: number): string {
  return n.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Saldo / montos en dólares (moneda contable de la cartera). Ej: "$1.234,56".
export function formatUsd(value: string | number | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${format(Math.abs(n))}`;
}

// Montos en bolívares (lo que declara el pagador / aparece en el comprobante).
// Ej: "1.234,56 Bs".
export function formatBs(value: string | number | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return "—";
  return `${format(n)} Bs`;
}

// Tasa USD/Bs congelada en un movimiento. Ej: "36,50 Bs/$".
export function formatRate(value: string | number | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return "—";
  return `${format(n)} Bs/$`;
}
