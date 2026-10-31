import type { Product, PurchasedProduct, Goal, Transaction, Priority, ProductStatus, GoalCategory, TransactionType } from '../types';
import { generateId, getFundingStatus } from './allocation';
import { normalizeUrl } from './url';

const VALID_PRIORITIES = new Set<Priority>(['low', 'medium', 'high', 'critical']);
const VALID_GOAL_CATEGORIES = new Set<GoalCategory>([
  'purchase', 'investment', 'travel', 'emergency', 'education', 'retirement', 'home', 'health', 'other'
]);
const VALID_TRANSACTION_TYPES = new Set<TransactionType>([
  'add_money', 'move_money', 'redistribute', 'price_change', 'mark_purchased', 'remove_product', 'goal_contribute', 'goal_withdraw', 'fund_adjustment'
]);
const VALID_ALLOCATION_METHODS = new Set(['unallocated', 'single', 'equal', 'percentage', 'custom']);

export const CURRENT_BACKUP_VERSION = 1;

function deriveSafeStatus(allocated: number, price: number): ProductStatus {
  const fs = getFundingStatus(allocated, price);
  if (fs === 'not_funded') return 'wishlist';
  if (fs === 'fully_funded' || fs === 'overfunded') return 'fully_funded';
  return 'saving';
}

export interface SanitizedBackup {
  totalFundPaise: number;
  products: Product[];
  purchasedProducts: PurchasedProduct[];
  goals: Goal[];
  transactions: Transaction[];
}

function readPaise(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid backup file: ${field} must be a nonnegative whole number of paise.`);
  }
  return value;
}

/**
 * Validates and sanitizes imported backup data.
 * Defensively ensures arrays and properties exist so that legacy or partial
 * JSON backups can never crash the app or brick localStorage.
 */
export function sanitizeBackupData(raw: any): SanitizedBackup {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backup file: file content is not a valid JSON object.');
  }

  // Handle Zustand persistence envelope (e.g. raw localStorage backup from ErrorBoundary)
  const source = (raw.state && typeof raw.state === 'object') ? raw.state : raw;
  const backupVersion = source._version ?? raw._version ?? CURRENT_BACKUP_VERSION;
  if (!Number.isSafeInteger(backupVersion) || backupVersion < 1 || backupVersion > CURRENT_BACKUP_VERSION) {
    throw new Error(`Unsupported backup version: ${String(backupVersion)}. This app supports backup version ${CURRENT_BACKUP_VERSION}.`);
  }

  const requiredArrays = ['products', 'purchasedProducts', 'goals', 'transactions'] as const;
  if (
    typeof source.totalFundPaise !== 'number' ||
    !Number.isSafeInteger(source.totalFundPaise) ||
    source.totalFundPaise < 0 ||
    requiredArrays.some((key) =>
      !Array.isArray(source[key]) ||
      source[key].some((record: unknown) => !record || typeof record !== 'object' || Array.isArray(record))
    )
  ) {
    throw new Error('Invalid backup file: expected a complete backup with a valid fund total and data lists.');
  }

  // 1. Total fund
  const totalFundPaise = readPaise(source.totalFundPaise, 'Total fund');

  // 2. Products
  const rawProducts = Array.isArray(source.products) ? source.products : [];
  const products: Product[] = rawProducts
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any): Product => {
      const pricePaise = readPaise(p.pricePaise, `Product "${p.name ?? 'Unnamed'}" price`);
      const allocatedPaise = readPaise(p.allocatedPaise, `Product "${p.name ?? 'Unnamed'}" allocation`);
      const priority: Priority = VALID_PRIORITIES.has(p.priority) ? p.priority : 'medium';
      const status: ProductStatus = deriveSafeStatus(allocatedPaise, pricePaise);

      const rawLinks = Array.isArray(p.links) ? p.links : [];
      const links = rawLinks
        .filter((l: any) => l && typeof l === 'object' && typeof l.url === 'string')
        .map((l: any) => ({
          id: typeof l.id === 'string' && l.id ? l.id : generateId(),
          label: typeof l.label === 'string' && l.label.trim() ? l.label.trim() : 'Link',
          url: normalizeUrl(l.url),
        }))
        .filter((l: any) => Boolean(l.url));

      return {
        id: typeof p.id === 'string' && p.id ? p.id : generateId(),
        name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : 'Unnamed Product',
        category: typeof p.category === 'string' && p.category.trim() ? p.category.trim() : 'Other',
        pricePaise,
        allocatedPaise,
        priority,
        status,
        imageUrl: typeof p.imageUrl === 'string' && p.imageUrl.trim() ? p.imageUrl.trim() : undefined,
        notes: typeof p.notes === 'string' && p.notes.trim() ? p.notes.trim() : undefined,
        links,
        targetDate: typeof p.targetDate === 'string' && p.targetDate.trim() ? p.targetDate.trim() : undefined,
        createdAt: typeof p.createdAt === 'string' && p.createdAt.trim() ? p.createdAt.trim() : new Date().toISOString(),
      };
    });

  // 3. Purchased Products
  const rawPurchased = Array.isArray(source.purchasedProducts) ? source.purchasedProducts : [];
  const purchasedProducts: PurchasedProduct[] = rawPurchased
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any): PurchasedProduct => {
      const originalPricePaise = readPaise(p.originalPricePaise, `Purchased product "${p.name ?? 'Unnamed'}" original price`);
      const allocatedPaise = readPaise(p.allocatedPaise, `Purchased product "${p.name ?? 'Unnamed'}" allocation`);
      const finalPricePaise = p.finalPricePaise === undefined
        ? originalPricePaise
        : readPaise(p.finalPricePaise, `Purchased product "${p.name ?? 'Unnamed'}" final price`);
      const deductedFundPaise = p.deductedFundPaise === undefined
        ? undefined
        : readPaise(p.deductedFundPaise, `Purchased product "${p.name ?? 'Unnamed'}" deducted fund`);
      const priority: Priority = VALID_PRIORITIES.has(p.priority) ? p.priority : 'medium';

      const rawLinks = Array.isArray(p.links) ? p.links : [];
      const links = rawLinks
        .filter((l: any) => l && typeof l === 'object' && typeof l.url === 'string')
        .map((l: any) => ({
          id: typeof l.id === 'string' && l.id ? l.id : generateId(),
          label: typeof l.label === 'string' && l.label.trim() ? l.label.trim() : 'Link',
          url: normalizeUrl(l.url),
        }))
        .filter((l: any) => Boolean(l.url));

      return {
        id: typeof p.id === 'string' && p.id ? p.id : generateId(),
        name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : 'Purchased Product',
        category: typeof p.category === 'string' && p.category.trim() ? p.category.trim() : 'Other',
        originalPricePaise,
        finalPricePaise,
        allocatedPaise,
        deductedFundPaise,
        priority,
        notes: typeof p.notes === 'string' && p.notes.trim() ? p.notes.trim() : undefined,
        imageUrl: typeof p.imageUrl === 'string' && p.imageUrl.trim() ? p.imageUrl.trim() : undefined,
        links,
        purchasedAt: typeof p.purchasedAt === 'string' && p.purchasedAt.trim() ? p.purchasedAt.trim() : new Date().toISOString(),
        targetDate: typeof p.targetDate === 'string' && p.targetDate.trim() ? p.targetDate.trim() : undefined,
        createdAt: typeof p.createdAt === 'string' && p.createdAt.trim() ? p.createdAt.trim() : new Date().toISOString(),
      };
    });

  // 4. Goals
  const rawGoals = Array.isArray(source.goals) ? source.goals : [];
  const goals: Goal[] = rawGoals
    .filter((g: any) => g && typeof g === 'object')
    .map((g: any): Goal => {
      const targetAmountPaise = readPaise(g.targetAmountPaise, `Goal "${g.name ?? 'Unnamed'}" target`);
      const savedAmountPaise = readPaise(g.savedAmountPaise, `Goal "${g.name ?? 'Unnamed'}" savings`);
      const category: GoalCategory = VALID_GOAL_CATEGORIES.has(g.category) ? g.category : 'purchase';
      const priority: Priority = VALID_PRIORITIES.has(g.priority) ? g.priority : 'medium';
      const color = typeof g.color === 'string' && g.color.trim() ? g.color.trim() : '#6366f1';
      const achieved = typeof g.achieved === 'boolean' ? g.achieved : savedAmountPaise >= targetAmountPaise && targetAmountPaise > 0;

      return {
        id: typeof g.id === 'string' && g.id ? g.id : generateId(),
        name: typeof g.name === 'string' && g.name.trim() ? g.name.trim() : 'Unnamed Goal',
        description: typeof g.description === 'string' && g.description.trim() ? g.description.trim() : undefined,
        category,
        targetAmountPaise,
        savedAmountPaise,
        monthlyContributionPaise: g.monthlyContributionPaise === undefined
          ? undefined
          : readPaise(g.monthlyContributionPaise, `Goal "${g.name ?? 'Unnamed'}" monthly contribution`),
        targetDate: typeof g.targetDate === 'string' && g.targetDate.trim() ? g.targetDate.trim() : undefined,
        priority,
        color,
        notes: typeof g.notes === 'string' && g.notes.trim() ? g.notes.trim() : undefined,
        createdAt: typeof g.createdAt === 'string' && g.createdAt.trim() ? g.createdAt.trim() : new Date().toISOString(),
        achieved,
        achievedAt: typeof g.achievedAt === 'string' && g.achievedAt.trim() ? g.achievedAt.trim() : undefined,
      };
    });

  // 5. Transactions
  const rawTx = Array.isArray(source.transactions) ? source.transactions : [];
  const transactions: Transaction[] = rawTx
    .filter((t: any) => t && typeof t === 'object')
    .map((t: any): Transaction => {
      if (!VALID_TRANSACTION_TYPES.has(t.type)) {
        throw new Error('Invalid backup file: transaction type is not supported.');
      }
      const type: TransactionType = t.type;
      const amountPaise = readPaise(t.amountPaise, `Transaction "${t.description ?? 'Transaction'}" amount`);
      const description = typeof t.description === 'string' && t.description.trim()
        ? t.description.trim()
        : 'Transaction';
      let fundDeltaPaise: number | undefined;
      if (t.fundDeltaPaise !== undefined) {
        if (typeof t.fundDeltaPaise !== 'number' || !Number.isSafeInteger(t.fundDeltaPaise)) {
          throw new Error('Invalid backup file: fund adjustment must be a signed whole number of paise.');
        }
        fundDeltaPaise = t.fundDeltaPaise;
      }
      if (type === 'fund_adjustment' && (fundDeltaPaise === undefined || Math.abs(fundDeltaPaise) !== amountPaise)) {
        throw new Error('Invalid backup file: fund adjustment amount does not match its recorded direction.');
      }

      let allocations: Transaction['allocations'];
      if (t.allocations !== undefined) {
        if (!Array.isArray(t.allocations)) {
          throw new Error('Invalid backup file: transaction allocations must be a list.');
        }
        allocations = t.allocations.map((allocation: any) => {
          if (
            !allocation || typeof allocation !== 'object' || Array.isArray(allocation) ||
            typeof allocation.productId !== 'string' || !allocation.productId.trim() ||
            typeof allocation.productName !== 'string' || !allocation.productName.trim()
          ) {
            throw new Error('Invalid backup file: each transaction allocation must include a product ID and name.');
          }
          return {
            productId: allocation.productId,
            productName: allocation.productName,
            amountPaise: readPaise(allocation.amountPaise, 'Transaction allocation amount'),
          };
        });
      }

      if (t.method !== undefined && !VALID_ALLOCATION_METHODS.has(t.method)) {
        throw new Error('Invalid backup file: transaction allocation method is not supported.');
      }

      return {
        id: typeof t.id === 'string' && t.id ? t.id : generateId(),
        date: typeof t.date === 'string' && t.date.trim() ? t.date.trim() : new Date().toISOString(),
        type,
        amountPaise,
        fundDeltaPaise,
        method: t.method,
        allocations,
        fromProductId: typeof t.fromProductId === 'string' ? t.fromProductId : undefined,
        fromProductName: typeof t.fromProductName === 'string' ? t.fromProductName : undefined,
        toProductId: typeof t.toProductId === 'string' ? t.toProductId : undefined,
        toProductName: typeof t.toProductName === 'string' ? t.toProductName : undefined,
        notes: typeof t.notes === 'string' && t.notes.trim() ? t.notes.trim() : undefined,
        description,
      };
    });

  const committedPaise = products.reduce((sum, p) => sum + p.allocatedPaise, 0)
    + goals.reduce((sum, g) => sum + g.savedAmountPaise, 0);
  if (!Number.isSafeInteger(committedPaise) || committedPaise > totalFundPaise) {
    throw new Error('Invalid backup file: allocated product and goal savings exceed the total fund. Your current data was not changed.');
  }

  return {
    totalFundPaise,
    products,
    purchasedProducts,
    goals,
    transactions,
  };
}
