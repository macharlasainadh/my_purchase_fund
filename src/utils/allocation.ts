import type { Product } from '../types';

// ─── Allocation Math ──────────────────────────────────────────────────────────

/**
 * Distribute `totalPaise` equally among N products.
 * Uses integer arithmetic; distributes remainder to first product(s).
 */
export function distributeEqually(
  totalPaise: number,
  products: Product[]
): { productId: string; amountPaise: number }[] {
  const n = products.length;
  if (n === 0) return [];
  const baseAmount = Math.floor(totalPaise / n);
  const remainder = totalPaise - baseAmount * n;
  return products.map((p, i) => ({
    productId: p.id,
    amountPaise: baseAmount + (i < remainder ? 1 : 0),
  }));
}

/**
 * Distribute `totalPaise` by percentages using largest-remainder method.
 * percentages: map of productId → percent (0–100, sum must be 100)
 */
export function distributeByPercentage(
  totalPaise: number,
  percentages: { productId: string; percent: number }[]
): { productId: string; amountPaise: number }[] {
  // Compute exact amounts
  const exactAmounts = percentages.map((p) => ({
    productId: p.productId,
    exact: (totalPaise * p.percent) / 100,
    floor: Math.floor((totalPaise * p.percent) / 100),
    remainder: ((totalPaise * p.percent) / 100) % 1,
  }));

  const totalFloor = exactAmounts.reduce((sum, e) => sum + e.floor, 0);
  let toDistribute = totalPaise - totalFloor;

  // Sort by remainder descending, distribute extras
  const sorted = [...exactAmounts].sort((a, b) => b.remainder - a.remainder);
  const extras = new Map<string, number>();
  for (let i = 0; i < sorted.length && toDistribute > 0; i++) {
    extras.set(sorted[i].productId, 1);
    toDistribute--;
  }

  return exactAmounts.map((e) => ({
    productId: e.productId,
    amountPaise: e.floor + (extras.get(e.productId) ?? 0),
  }));
}

/** Calculate funding status */
export function getFundingStatus(
  allocatedPaise: number,
  pricePaise: number
): 'not_funded' | 'partially_funded' | 'fully_funded' | 'overfunded' {
  if (allocatedPaise <= 0) return 'not_funded';
  if (allocatedPaise > pricePaise) return 'overfunded';
  if (allocatedPaise === pricePaise) return 'fully_funded';
  return 'partially_funded';
}

/** Calculate funding percentage (capped at 100 unless overfunded) */
export function getFundingPercent(allocatedPaise: number, pricePaise: number): number {
  if (pricePaise === 0) return allocatedPaise > 0 ? 100 : 0;
  return Math.round((allocatedPaise / pricePaise) * 1000) / 10; // 1 decimal
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
