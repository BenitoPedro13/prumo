/**
 * Number, money and date formatting, all pt-BR, in one place — the first page that prints a
 * price should not be the place where the convention gets decided.
 *
 * Money is rounded to whole reais. Nobody negotiating a R$ 289.000 apartment is served by two
 * decimal places, and the cents would imply a precision the table does not have.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const DECIMAL = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/**
 * Dates arrive from Payload as ISO strings at midnight UTC — a delivery month, a table's
 * validity, the day an index was revised. Formatted in São Paulo time those land three hours
 * earlier and print the previous day, which turned "entrega em março de 2029" into February and
 * a table valid "até 31/08" into the 30th.
 *
 * So calendar dates are formatted in UTC, which is the calendar they were written in. Real
 * instants — `updatedAt`, and anything else stamped by the server — pass their own zone.
 */
export const FUSO_BRASIL = "America/Sao_Paulo";

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function formatter(
  style: Intl.DateTimeFormatOptions,
  timeZone: string,
  key: string,
): Intl.DateTimeFormat {
  const cacheKey = `${key}:${timeZone}`;
  let cached = dateFormatters.get(cacheKey);

  if (!cached) {
    cached = new Intl.DateTimeFormat("pt-BR", { ...style, timeZone });
    dateFormatters.set(cacheKey, cached);
  }

  return cached;
}

const PERCENT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 2,
});

const LONG = { day: "numeric", month: "long", year: "numeric" } as const;
const SHORT = { day: "2-digit", month: "2-digit", year: "numeric" } as const;
const MONTH = { month: "long", year: "numeric" } as const;

export function formatBRL(value: number): string {
  return BRL.format(value);
}

/** A band, not a price. The wording is the caller's; this only sets the numbers. */
export function formatBRLRange(minimo?: number | null, maximo?: number | null): string | null {
  if (typeof minimo === "number" && typeof maximo === "number") {
    return `${formatBRL(minimo)} a ${formatBRL(maximo)}`;
  }
  if (typeof minimo === "number") return `a partir de ${formatBRL(minimo)}`;
  if (typeof maximo === "number") return `até ${formatBRL(maximo)}`;
  return null;
}

export function formatArea(m2: number): string {
  return `${DECIMAL.format(m2)} m²`;
}

/** "12 de agosto de 2026" — for anything a person reads as a sentence. */
export function formatDate(value: Date | string, timeZone = "UTC"): string {
  return formatter(LONG, timeZone, "long").format(toDate(value));
}

/** "12/08/2026" — for validity dates, where a person is checking a number, not reading. */
export function formatShortDate(value: Date | string, timeZone = "UTC"): string {
  return formatter(SHORT, timeZone, "short").format(toDate(value));
}

/** "dezembro de 2027" — delivery is a month, never a day, and pretending otherwise is a claim. */
export function formatMonthYear(value: Date | string, timeZone = "UTC"): string {
  return formatter(MONTH, timeZone, "month").format(toDate(value));
}

/** Takes 0.0812 and returns "8,12%". */
export function formatPercent(rate: number): string {
  return PERCENT.format(rate);
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
