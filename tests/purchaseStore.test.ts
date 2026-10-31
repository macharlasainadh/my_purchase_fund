import { beforeEach, describe, expect, it } from 'vitest';
import { usePurchaseStore, selectFundSummary } from '../src/store/usePurchaseStore';
import { sanitizeBackupData } from '../src/utils/sanitizeBackup';
import type { Goal, Product, PurchaseState } from '../src/types';

const product = (id: string, allocatedPaise: number, pricePaise = 10000): Product => ({
  id,
  name: `Product ${id}`,
  category: 'Other',
  pricePaise,
  allocatedPaise,
  priority: 'medium',
  status: allocatedPaise >= pricePaise ? 'fully_funded' : allocatedPaise > 0 ? 'saving' : 'wishlist',
  links: [],
  createdAt: '2026-01-01T00:00:00.000Z',
});

const goal = (id: string, savedAmountPaise: number, targetAmountPaise = 5000): Goal => ({
  id,
  name: `Goal ${id}`,
  category: 'purchase',
  targetAmountPaise,
  savedAmountPaise,
  priority: 'medium',
  color: '#6366f1',
  createdAt: '2026-01-01T00:00:00.000Z',
  achieved: savedAmountPaise >= targetAmountPaise,
});

function resetStore(overrides: Partial<PurchaseState> = {}) {
  usePurchaseStore.setState({
    totalFundPaise: 0,
    products: [],
    purchasedProducts: [],
    goals: [],
    transactions: [],
    darkMode: false,
    activeTab: 'products',
    ...overrides,
  });
  usePurchaseStore.getState().clearUndo();
}

describe('fund accounting', () => {
  beforeEach(() => resetStore());

  it('records signed fund changes and never reduces the total below committed funds', () => {
    resetStore({
      totalFundPaise: 10000,
      products: [product('p1', 4000)],
      goals: [goal('g1', 1000)],
    });

    usePurchaseStore.getState().setTotalFund(12000);
    expect(usePurchaseStore.getState().totalFundPaise).toBe(12000);
    expect(usePurchaseStore.getState().transactions[0].fundDeltaPaise).toBe(2000);

    usePurchaseStore.getState().setTotalFund(4500);
    const state = usePurchaseStore.getState();
    expect(state.totalFundPaise).toBe(5000);
    expect(state.transactions[0].fundDeltaPaise).toBe(-7000);
    expect(selectFundSummary(state).unallocatedPaise).toBe(0);
    expect(selectFundSummary(state).totalCommittedPaise).toBe(5000);
  });
});

describe('purchase accounting', () => {
  beforeEach(() => resetStore());

  it('deducts the actual purchase price and restores the deducted fund and allocation', () => {
    resetStore({
      totalFundPaise: 18000,
      products: [product('p1', 10000), product('p2', 3000)],
    });

    usePurchaseStore.getState().markAsPurchased('p1', 12000, 'unallocated');
    let state = usePurchaseStore.getState();
    expect(state.totalFundPaise).toBe(6000);
    expect(state.products.map((item) => item.id)).toEqual(['p2']);
    expect(state.purchasedProducts[0].deductedFundPaise).toBe(12000);
    expect(selectFundSummary(state).unallocatedPaise).toBe(3000);

    usePurchaseStore.getState().restorePurchasedProduct('p1');
    state = usePurchaseStore.getState();
    expect(state.totalFundPaise).toBe(18000);
    expect(state.purchasedProducts).toHaveLength(0);
    expect(state.products.find((item) => item.id === 'p1')?.allocatedPaise).toBe(10000);
    expect(selectFundSummary(state).unallocatedPaise).toBe(5000);
  });
});

describe('goal accounting', () => {
  beforeEach(() => resetStore());

  it('moves available money into goal savings and returns withdrawals to unallocated funds', () => {
    resetStore({
      totalFundPaise: 5000,
      products: [product('p1', 3000)],
      goals: [goal('g1', 1000)],
    });

    usePurchaseStore.getState().contributeToGoal('g1', 800);
    let state = usePurchaseStore.getState();
    expect(state.goals[0].savedAmountPaise).toBe(1800);
    expect(selectFundSummary(state).unallocatedPaise).toBe(200);

    usePurchaseStore.getState().contributeToGoal('g1', 201);
    expect(usePurchaseStore.getState().goals[0].savedAmountPaise).toBe(1800);

    usePurchaseStore.getState().withdrawFromGoal('g1', 300);
    state = usePurchaseStore.getState();
    expect(state.goals[0].savedAmountPaise).toBe(1500);
    expect(selectFundSummary(state).unallocatedPaise).toBe(500);

    usePurchaseStore.getState().withdrawFromGoal('g1', 9000);
    state = usePurchaseStore.getState();
    expect(state.goals[0].savedAmountPaise).toBe(0);
    expect(selectFundSummary(state).unallocatedPaise).toBe(2000);
    expect(state.transactions[0].amountPaise).toBe(1500);
  });
});

describe('backup validation and restore safety', () => {
  beforeEach(() => resetStore());

  it('rejects malformed transaction allocations', () => {
    expect(() => sanitizeBackupData({
      totalFundPaise: 1000,
      products: [],
      purchasedProducts: [],
      goals: [],
      transactions: [{
        id: 'tx1',
        date: '2026-01-01T00:00:00.000Z',
        type: 'add_money',
        amountPaise: 1000,
        description: 'Added funds',
        allocations: [null],
      }],
    })).toThrow(/allocation/i);
  });

  it('rejects an invalid restore without replacing the current state', () => {
    resetStore({ totalFundPaise: 10000, products: [product('kept', 5000)] });
    const before = usePurchaseStore.getState();

    expect(() => usePurchaseStore.getState().restoreFromBackup({
      _version: 1,
      totalFundPaise: 1000,
      products: [],
      purchasedProducts: [],
      goals: [],
      transactions: [{
        id: 'tx1',
        date: '2026-01-01T00:00:00.000Z',
        type: 'add_money',
        amountPaise: 1000,
        description: 'Bad transaction',
        allocations: [{ productId: 'p1', productName: 'P1', amountPaise: -1 }],
      }],
    })).toThrow(/nonnegative/i);

    const after = usePurchaseStore.getState();
    expect(after.totalFundPaise).toBe(before.totalFundPaise);
    expect(after.products).toEqual(before.products);
    expect(after.transactions).toEqual(before.transactions);
  });

  it('accepts unversioned legacy exports as version 1 and rejects unknown future versions', () => {
    const legacy = { totalFundPaise: 0, products: [], purchasedProducts: [], goals: [], transactions: [] };
    expect(sanitizeBackupData(legacy).totalFundPaise).toBe(0);
    expect(() => sanitizeBackupData({ ...legacy, _version: 2 })).toThrow(/unsupported backup version/i);
  });
});
