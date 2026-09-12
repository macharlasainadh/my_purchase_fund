// ─── Core Types ──────────────────────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ProductStatus = 'wishlist' | 'saving' | 'fully_funded' | 'purchased';
export type FundingStatus = 'not_funded' | 'partially_funded' | 'fully_funded' | 'overfunded';

export type AllocationMethod =
  | 'unallocated'
  | 'single'
  | 'equal'
  | 'percentage'
  | 'custom';

export type TransactionType =
  | 'add_money'
  | 'move_money'
  | 'redistribute'
  | 'price_change'
  | 'mark_purchased'
  | 'remove_product'
  | 'goal_contribute'
  | 'goal_withdraw';

export type GoalCategory =
  | 'purchase'
  | 'investment'
  | 'travel'
  | 'emergency'
  | 'education'
  | 'retirement'
  | 'home'
  | 'health'
  | 'other';

export interface ProductLink {
  id: string;
  label: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Price in paise (₹1 = 100 paise) */
  pricePaise: number;
  /** Money currently allocated to this product, in paise */
  allocatedPaise: number;
  priority: Priority;
  status: ProductStatus;
  imageUrl?: string;
  notes?: string;
  links: ProductLink[];
  targetDate?: string; // ISO date string YYYY-MM-DD
  createdAt: string;   // ISO timestamp
}

export interface PurchasedProduct {
  id: string;
  name: string;
  category: string;
  originalPricePaise: number;
  finalPricePaise: number;
  allocatedPaise: number;
  priority: Priority;
  notes?: string;
  imageUrl?: string;
  links: ProductLink[];
  purchasedAt: string; // ISO timestamp
  targetDate?: string;
  createdAt: string;
  /** Actual amount deducted from totalFundPaise at time of purchase */
  deductedFundPaise?: number;
}

// ─── Long-term Goals ──────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: GoalCategory;
  /** Final target amount in paise */
  targetAmountPaise: number;
  /** Currently saved/allocated amount in paise */
  savedAmountPaise: number;
  /** Optional: how much per month they intend to contribute, in paise */
  monthlyContributionPaise?: number;
  targetDate?: string;   // ISO YYYY-MM-DD
  priority: Priority;
  /** Accent color hex for this goal card */
  color: string;
  notes?: string;
  createdAt: string;
  /** Whether this goal has been achieved */
  achieved: boolean;
  achievedAt?: string;
}

// ─── Allocations ─────────────────────────────────────────────────────────────

export interface AllocationEntry {
  productId: string;
  productName: string;
  /** Amount in paise */
  amountPaise: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO timestamp
  type: TransactionType;
  /** Primary amount involved, in paise */
  amountPaise: number;
  method?: AllocationMethod;
  allocations?: AllocationEntry[];
  fromProductId?: string;
  fromProductName?: string;
  toProductId?: string;
  toProductName?: string;
  notes?: string;
  description: string;
}

// ─── Store State ─────────────────────────────────────────────────────────────

export interface PurchaseState {
  /** All money ever added to the fund, in paise */
  totalFundPaise: number;
  products: Product[];
  purchasedProducts: PurchasedProduct[];
  goals: Goal[];
  transactions: Transaction[];
  /** UI settings */
  darkMode: boolean;
  activeTab: 'products' | 'goals' | 'history' | 'purchased';
}

// ─── Derived / Helper Types ───────────────────────────────────────────────────

export interface FundSummary {
  totalFundPaise: number;
  totalAllocatedPaise: number;
  unallocatedPaise: number;
  totalRequiredPaise: number;
  remainingRequiredPaise: number;
  overallProgressPercent: number;
}

export interface ProductCardData extends Product {
  remainingPaise: number;
  fundingPercent: number;
  fundingStatus: FundingStatus;
}
