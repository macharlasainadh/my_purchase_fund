import type { Product, PurchasedProduct, Goal, Transaction, Priority, ProductStatus, GoalCategory, TransactionType } from '../types';
import { generateId, getFundingStatus } from './allocation';
import { normalizeUrl } from './url';

const VALID_PRIORITIES = new Set<Priority>(['low', 'medium', 'high', 'critical']);
const VALID_PRODUCT_STATUSES = new Set<ProductStatus>(['wishlist', 'saving', 'fully_funded', 'purchased']);
const VALID_GOAL_CATEGORIES = new Set<GoalCategory>([
  'purchase', 'investment', 'travel', 'emergency', 'education', 'retirement', 'home', 'health', 'other'
]);
const VALID_TRANSACTION_TYPES = new Set<TransactionType>([
  'add_money', 'move_money', 'redistribute', 'price_change', 'mark_purchased', 'remove_product', 'goal_contribute', 'goal_withdraw'
]);

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

  // 1. Total fund
  const totalFundPaise = typeof source.totalFundPaise === 'number' && !isNaN(source.totalFundPaise) && source.totalFundPaise >= 0
    ? Math.round(source.totalFundPaise)
    : 0;

  // 2. Products
  const rawProducts = Array.isArray(source.products) ? source.products : [];
  const products: Product[] = rawProducts
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any): Product => {
      const pricePaise = typeof p.pricePaise === 'number' && !isNaN(p.pricePaise) && p.pricePaise >= 0
        ? Math.round(p.pricePaise)
        : 0;
      const allocatedPaise = typeof p.allocatedPaise === 'number' && !isNaN(p.allocatedPaise) && p.allocatedPaise >= 0
        ? Math.round(p.allocatedPaise)
        : 0;
      const priority: Priority = VALID_PRIORITIES.has(p.priority) ? p.priority : 'medium';
      const status: ProductStatus = VALID_PRODUCT_STATUSES.has(p.status)
        ? p.status
        : deriveSafeStatus(allocatedPaise, pricePaise);

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
      const originalPricePaise = typeof p.originalPricePaise === 'number' && !isNaN(p.originalPricePaise) && p.originalPricePaise >= 0
        ? Math.round(p.originalPricePaise)
        : 0;
      const allocatedPaise = typeof p.allocatedPaise === 'number' && !isNaN(p.allocatedPaise) && p.allocatedPaise >= 0
        ? Math.round(p.allocatedPaise)
        : 0;
      const finalPricePaise = typeof p.finalPricePaise === 'number' && !isNaN(p.finalPricePaise) && p.finalPricePaise >= 0
        ? Math.round(p.finalPricePaise)
        : originalPricePaise;
      const deductedFundPaise = typeof p.deductedFundPaise === 'number' && !isNaN(p.deductedFundPaise) && p.deductedFundPaise >= 0
        ? Math.round(p.deductedFundPaise)
        : undefined;
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
      const targetAmountPaise = typeof g.targetAmountPaise === 'number' && !isNaN(g.targetAmountPaise) && g.targetAmountPaise >= 0
        ? Math.round(g.targetAmountPaise)
        : 0;
      const savedAmountPaise = typeof g.savedAmountPaise === 'number' && !isNaN(g.savedAmountPaise) && g.savedAmountPaise >= 0
        ? Math.round(g.savedAmountPaise)
        : 0;
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
        monthlyContributionPaise: typeof g.monthlyContributionPaise === 'number' && !isNaN(g.monthlyContributionPaise) && g.monthlyContributionPaise > 0
          ? Math.round(g.monthlyContributionPaise)
          : undefined,
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
      const type: TransactionType = VALID_TRANSACTION_TYPES.has(t.type) ? t.type : 'add_money';
      const amountPaise = typeof t.amountPaise === 'number' && !isNaN(t.amountPaise) && t.amountPaise >= 0
        ? Math.round(t.amountPaise)
        : 0;

      return {
        id: typeof t.id === 'string' && t.id ? t.id : generateId(),
        date: typeof t.date === 'string' && t.date.trim() ? t.date.trim() : new Date().toISOString(),
        type,
        amountPaise,
        method: t.method,
        allocations: Array.isArray(t.allocations) ? t.allocations : undefined,
        fromProductId: typeof t.fromProductId === 'string' ? t.fromProductId : undefined,
        fromProductName: typeof t.fromProductName === 'string' ? t.fromProductName : undefined,
        toProductId: typeof t.toProductId === 'string' ? t.toProductId : undefined,
        toProductName: typeof t.toProductName === 'string' ? t.toProductName : undefined,
        notes: typeof t.notes === 'string' && t.notes.trim() ? t.notes.trim() : undefined,
        description: typeof t.description === 'string' && t.description.trim() ? t.description.trim() : 'Transaction',
      };
    });

  return {
    totalFundPaise,
    products,
    purchasedProducts,
    goals,
    transactions,
  };
}
