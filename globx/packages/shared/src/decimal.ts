// Decimal.js wrapper for safe money math
// NEVER use floating point for financial calculations

import Decimal from "decimal.js";

// Configure Decimal.js for financial precision
Decimal.set({
  precision: 78, // Match Prisma Decimal(78, 0) for Solana amounts
  rounding: Decimal.ROUND_DOWN, // Always round down for user funds
  toExpNeg: -9e15,
  toExpPos: 9e15,
  maxE: 9e15,
  minE: -9e15,
});

export { Decimal };

// Convert Solana lamports (or token amount) to Decimal

export function fromLamports(lamports: bigint | string | number): Decimal {
  return new Decimal(lamports.toString());
}

// Convert Decimal to bigint (for Solana amounts)

export function toLamports(decimal: Decimal): bigint {
  return BigInt(decimal.toFixed(0));
}

// Safe addition: a + b

export function add(
  a: Decimal | bigint | string | number,
  b: Decimal | bigint | string | number,
): Decimal {
  const aDec = a instanceof Decimal ? a : new Decimal(a.toString());
  const bDec = b instanceof Decimal ? b : new Decimal(b.toString());
  return aDec.plus(bDec);
}

// Safe subtraction: a - b

export function subtract(
  a: Decimal | bigint | string | number,
  b: Decimal | bigint | string | number,
): Decimal {
  const aDec = a instanceof Decimal ? a : new Decimal(a.toString());
  const bDec = b instanceof Decimal ? b : new Decimal(b.toString());
  return aDec.minus(bDec);
}

// Safe multiplication: a * b

export function multiply(
  a: Decimal | bigint | string | number,
  b: Decimal | bigint | string | number,
): Decimal {
  const aDec = a instanceof Decimal ? a : new Decimal(a.toString());
  const bDec = b instanceof Decimal ? b : new Decimal(b.toString());
  return aDec.times(bDec);
}

// Safe division: a / b

export function divide(
  a: Decimal | bigint | string | number,
  b: Decimal | bigint | string | number,
): Decimal {
  const aDec = a instanceof Decimal ? a : new Decimal(a.toString());
  const bDec = b instanceof Decimal ? b : new Decimal(b.toString());
  if (bDec.isZero()) {
    throw new Error("Division by zero");
  }
  return aDec.dividedBy(bDec);
}

// Compare two decimals: returns -1 if a < b, 0 if a == b, 1 if a > b

export function compare(
  a: Decimal | bigint | string | number,
  b: Decimal | bigint | string | number,
): number {
  const aDec = a instanceof Decimal ? a : new Decimal(a.toString());
  const bDec = b instanceof Decimal ? b : new Decimal(b.toString());
  return aDec.comparedTo(bDec);
}

// Check if amount is zero

export function isZero(amount: Decimal | bigint | string | number): boolean {
  const dec =
    amount instanceof Decimal ? amount : new Decimal(amount.toString());
  return dec.isZero();
}

// Check if amount is positive

export function isPositive(
  amount: Decimal | bigint | string | number,
): boolean {
  const dec =
    amount instanceof Decimal ? amount : new Decimal(amount.toString());
  return dec.isPositive();
}

// Check if amount is negative

export function isNegative(
  amount: Decimal | bigint | string | number,
): boolean {
  const dec =
    amount instanceof Decimal ? amount : new Decimal(amount.toString());
  return dec.isNegative();
}
