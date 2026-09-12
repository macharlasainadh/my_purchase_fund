import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PurchaseState,
  Product,
  PurchasedProduct,
  Goal,
  Transaction,
  AllocationEntry,
  AllocationMethod,
  Priority,
  ProductLink,
} from '../types';
import { generateId, getFundingStatus } from '../utils/allocation';
import { sanitizeBackupData } from '../utils/sanitizeBackup';

// ─── Store Actions Interface ──────────────────────────────────────────────────

interface PurchaseActions {
  // Fund
  addMoney: (
    amountPaise: number,
    method: AllocationMethod,
    allocations: AllocationEntry[],
    notes?: string
  ) => void;
  setTotalFund: (amountPaise: number) => void;

  // Products
  addProduct: (data: Omit<Product, 'id' | 'allocatedPaise' | 'status' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id' | 'allocatedPaise' | 'status' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  updateProductPrice: (id: string, newPricePaise: number, excessAction: 'keep' | 'unallocated' | 'none') => void;

  // Allocations
  allocateToProduct: (productId: string, amountPaise: number) => void;
  moveMoney: (fromProductId: string, toProductId: string, amountPaise: number) => void;
  /** Distribute existing unallocated money — total fund does NOT change */
  distributeFromUnallocated: (allocations: AllocationEntry[]) => void;
  redistribute: (allocations: AllocationEntry[]) => void;

  // Purchased
  markAsPurchased: (
    productId: string,
    finalPricePaise: number,
    excessAction: 'keep' | 'unallocated',
    notes?: string
  ) => void;
  restorePurchasedProduct: (purchasedId: string) => void;

  // Goals
  addGoal: (data: Omit<Goal, 'id' | 'savedAmountPaise' | 'createdAt' | 'achieved'>) => void;
  updateGoal: (id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amountPaise: number, notes?: string) => void;
  withdrawFromGoal: (goalId: string, amountPaise: number, notes?: string) => void;
  markGoalAchieved: (goalId: string) => void;

  // UI
  setDarkMode: (val: boolean) => void;
  setActiveTab: (tab: PurchaseState['activeTab']) => void;

  // Undo
  undoLabel: string;
  saveUndo: (label: string) => void;
  undo: () => void;
  clearUndo: () => void;

  // Toast notifications
  toastMessage: string;
  toastType: 'success' | 'info';
  showToast: (message: string, type?: 'success' | 'info') => void;
  clearToast: () => void;

  // Data management
  restoreFromBackup: (data: any) => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PurchaseState = {
  totalFundPaise: 0,
  products: [],
  purchasedProducts: [],
  goals: [],
  transactions: [],
  darkMode: false,
  activeTab: 'products',
};

// Undo snapshot (NOT persisted — held in memory only)
type UndoSnapshot = Pick<PurchaseState, 'totalFundPaise' | 'products' | 'purchasedProducts' | 'goals' | 'transactions'>;
let _undoSnapshot: UndoSnapshot | null = null;

// ─── Helper: derive product status ────────────────────────────────────────────
function deriveStatus(allocated: number, price: number): Product['status'] {
  const fs = getFundingStatus(allocated, price);
  if (fs === 'not_funded') return 'wishlist';
  if (fs === 'fully_funded' || fs === 'overfunded') return 'fully_funded';
  return 'saving';
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePurchaseStore = create<PurchaseState & PurchaseActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      undoLabel: '',
      toastMessage: '',
      toastType: 'success',

      // ── Fund ──────────────────────────────────────────────────────────────

      addMoney(amountPaise, method, allocations, notes) {
        set((state) => {
          const newTotal = state.totalFundPaise + amountPaise;
          const updatedProducts = state.products.map((p) => {
            const entry = allocations.find((a) => a.productId === p.id);
            if (!entry) return p;
            const newAllocated = p.allocatedPaise + entry.amountPaise;
            return {
              ...p,
              allocatedPaise: newAllocated,
              status: deriveStatus(newAllocated, p.pricePaise),
            };
          });

          const tx: Transaction = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'add_money',
            amountPaise,
            method,
            allocations,
            notes,
            description: `Added ₹${(amountPaise / 100).toLocaleString('en-IN')} via ${method}`,
          };

          return {
            totalFundPaise: newTotal,
            products: updatedProducts,
            transactions: [tx, ...state.transactions],
            toastMessage: `Added ₹${(amountPaise / 100).toLocaleString('en-IN')} to fund`,
            toastType: 'success' as const,
          };
        });
      },

      setTotalFund(amountPaise) {
        const state = get();
        const summary = selectFundSummary(state);
        const minRequired = summary.totalCommittedPaise;
        const validAmount = Math.max(minRequired, amountPaise);
        set({
          totalFundPaise: validAmount,
          toastMessage: `Total fund updated to ₹${(validAmount / 100).toLocaleString('en-IN')}`,
          toastType: 'success',
        });
      },

      // ── Products ──────────────────────────────────────────────────────────

      addProduct(data) {
        const product: Product = {
          ...data,
          id: generateId(),
          allocatedPaise: 0,
          status: 'wishlist',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          products: [...state.products, product],
          toastMessage: `"${data.name}" added to products`,
          toastType: 'success',
        }));
      },

      updateProduct(id, data) {
        set((state) => {
          const product = state.products.find((p) => p.id === id);
          if (!product) return state;

          const priceChanged = typeof data.pricePaise === 'number' && data.pricePaise !== product.pricePaise;
          const oldPrice = product.pricePaise;
          const newPrice = typeof data.pricePaise === 'number' ? data.pricePaise : oldPrice;

          const updatedProducts = state.products.map((p) => {
            if (p.id !== id) return p;
            const updated = { ...p, ...data };
            return { ...updated, status: deriveStatus(updated.allocatedPaise, updated.pricePaise) };
          });

          let txs = state.transactions;
          if (priceChanged) {
            const priceTx: Transaction = {
              id: generateId(),
              date: new Date().toISOString(),
              type: 'price_change',
              amountPaise: Math.abs(newPrice - oldPrice),
              toProductId: product.id,
              toProductName: data.name ?? product.name,
              description: `Price changed for "${product.name}": ₹${(oldPrice / 100).toLocaleString('en-IN')} → ₹${(newPrice / 100).toLocaleString('en-IN')}`,
            };
            txs = [priceTx, ...txs];
          }

          return {
            products: updatedProducts,
            transactions: txs,
            toastMessage: priceChanged
              ? `Updated "${product.name}" price to ₹${(newPrice / 100).toLocaleString('en-IN')}`
              : 'Product updated successfully',
            toastType: 'success' as const,
          };
        });
      },

      deleteProduct(id) {
        const { products, transactions, saveUndo } = get();
        const product = products.find((p) => p.id === id);
        if (!product) return;
        saveUndo(`"${product.name}" deleted`);
        // Return allocated money to unallocated (totalFund stays; allocated drops)
        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'remove_product',
          amountPaise: product.allocatedPaise,
          description: `Deleted product "${product.name}" — ₹${(product.allocatedPaise / 100).toLocaleString('en-IN')} returned to unallocated`,
        };
        set({
          products: products.filter((p) => p.id !== id),
          transactions: product.allocatedPaise > 0 ? [tx, ...transactions] : transactions,
        });
      },

      updateProductPrice(id, newPricePaise, excessAction) {
        set((state) => {
          const product = state.products.find((p) => p.id === id);
          if (!product) return state;

          const oldPrice = product.pricePaise;
          let products = state.products.map((p) => {
            if (p.id !== id) return p;
            let newAllocated = p.allocatedPaise;
            if (excessAction === 'unallocated' && newAllocated > newPricePaise) {
              newAllocated = newPricePaise;
            }
            return {
              ...p,
              pricePaise: newPricePaise,
              allocatedPaise: newAllocated,
              status: deriveStatus(newAllocated, newPricePaise),
            };
          });

          const tx: Transaction = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'price_change',
            amountPaise: Math.abs(newPricePaise - oldPrice),
            description: `Price updated for "${product.name}": ₹${(oldPrice / 100).toLocaleString('en-IN')} → ₹${(newPricePaise / 100).toLocaleString('en-IN')}`,
          };

          return { products, transactions: [tx, ...state.transactions] };
        });
      },

      // ── Allocations ───────────────────────────────────────────────────────

      allocateToProduct(productId, amountPaise) {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const newAllocated = p.allocatedPaise + amountPaise;
            return { ...p, allocatedPaise: newAllocated, status: deriveStatus(newAllocated, p.pricePaise) };
          }),
        }));
      },

      moveMoney(fromProductId, toProductId, amountPaise) {
        const { products, transactions } = get();
        const from = products.find((p) => p.id === fromProductId);
        const to = products.find((p) => p.id === toProductId);
        if (!from || !to) return;

        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'move_money',
          amountPaise,
          fromProductId,
          fromProductName: from.name,
          toProductId,
          toProductName: to.name,
          description: `Moved ₹${(amountPaise / 100).toLocaleString('en-IN')} from "${from.name}" → "${to.name}"`,
        };

        set({
          products: products.map((p) => {
            if (p.id === fromProductId) {
              const newAllocated = p.allocatedPaise - amountPaise;
              return { ...p, allocatedPaise: newAllocated, status: deriveStatus(newAllocated, p.pricePaise) };
            }
            if (p.id === toProductId) {
              const newAllocated = p.allocatedPaise + amountPaise;
              return { ...p, allocatedPaise: newAllocated, status: deriveStatus(newAllocated, p.pricePaise) };
            }
            return p;
          }),
          transactions: [tx, ...transactions],
          toastMessage: `Moved ₹${(amountPaise / 100).toLocaleString('en-IN')} to "${to.name}"`,
          toastType: 'success',
        });
      },

      distributeFromUnallocated(allocations) {
        const { products, transactions } = get();
        const totalPaise = allocations.reduce((s, a) => s + a.amountPaise, 0);
        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'add_money',
          amountPaise: totalPaise,
          method: 'equal',
          allocations,
          description: `Equally distributed ₹${(totalPaise / 100).toLocaleString('en-IN')} from unallocated funds among ${allocations.length} product(s)`,
        };
        set({
          products: products.map((p) => {
            const entry = allocations.find((a) => a.productId === p.id);
            if (!entry) return p;
            const newAllocated = p.allocatedPaise + entry.amountPaise;
            return { ...p, allocatedPaise: newAllocated, status: deriveStatus(newAllocated, p.pricePaise) };
          }),
          transactions: [tx, ...transactions],
          toastMessage: `Distributed ₹${(totalPaise / 100).toLocaleString('en-IN')} equally`,
          toastType: 'success',
          // totalFundPaise stays unchanged — money comes from existing unallocated pool
        });
      },

      redistribute(allocations) {
        const { products, transactions } = get();
        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'redistribute',
          amountPaise: allocations.reduce((s, a) => s + a.amountPaise, 0),
          allocations,
          description: `Redistributed funds among ${allocations.length} product(s)`,
        };

        set({
          products: products.map((p) => {
            const entry = allocations.find((a) => a.productId === p.id);
            if (!entry) return p;
            return { ...p, allocatedPaise: entry.amountPaise, status: deriveStatus(entry.amountPaise, p.pricePaise) };
          }),
          transactions: [tx, ...transactions],
          toastMessage: 'Funds redistributed successfully',
          toastType: 'success',
        });
      },

      // ── Purchased ─────────────────────────────────────────────────────────

      markAsPurchased(productId, finalPricePaise, excessAction, notes) {
        const { products, purchasedProducts, transactions, totalFundPaise } = get();
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const excessPaise = product.allocatedPaise - finalPricePaise;
        let newTotalFund: number;
        let deductedFundPaise: number;

        if (finalPricePaise > product.allocatedPaise) {
          // Over-budget purchase: deduct the actual full price spent from the fund
          newTotalFund = totalFundPaise - finalPricePaise;
          deductedFundPaise = finalPricePaise;
        } else if (excessAction === 'keep' && excessPaise > 0) {
          // User chose to remove the entire allocated budget from the fund
          newTotalFund = totalFundPaise - product.allocatedPaise;
          deductedFundPaise = product.allocatedPaise;
        } else {
          // Default ('unallocated'): deduct only what was spent; excess stays in fund as unallocated
          newTotalFund = totalFundPaise - finalPricePaise;
          deductedFundPaise = finalPricePaise;
        }

        const purchased: PurchasedProduct = {
          id: product.id,
          name: product.name,
          category: product.category,
          originalPricePaise: product.pricePaise,
          finalPricePaise,
          allocatedPaise: product.allocatedPaise,
          deductedFundPaise,
          priority: product.priority,
          notes: notes ?? product.notes,
          imageUrl: product.imageUrl,
          links: product.links,
          purchasedAt: new Date().toISOString(),
          targetDate: product.targetDate,
          createdAt: product.createdAt,
        };

        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'mark_purchased',
          amountPaise: finalPricePaise,
          fromProductId: productId,
          fromProductName: product.name,
          notes,
          description: `Marked "${product.name}" as purchased for ₹${(finalPricePaise / 100).toLocaleString('en-IN')}`,
        };

        set({
          totalFundPaise: Math.max(0, newTotalFund),
          products: products.filter((p) => p.id !== productId),
          purchasedProducts: [purchased, ...purchasedProducts],
          transactions: [tx, ...transactions],
          toastMessage: `"${product.name}" marked as purchased!`,
          toastType: 'success',
        });
      },

      restorePurchasedProduct(purchasedId) {
        const { purchasedProducts, products, totalFundPaise, transactions } = get();
        const purchased = purchasedProducts.find((p) => p.id === purchasedId);
        if (!purchased) return;

        const product: Product = {
          id: purchased.id,
          name: purchased.name,
          category: purchased.category,
          pricePaise: purchased.originalPricePaise,
          allocatedPaise: purchased.allocatedPaise,
          priority: purchased.priority,
          status: deriveStatus(purchased.allocatedPaise, purchased.originalPricePaise),
          imageUrl: purchased.imageUrl,
          notes: purchased.notes,
          links: purchased.links,
          targetDate: purchased.targetDate,
          createdAt: purchased.createdAt,
        };

        // Restore the funds that were actually deducted back into totalFund
        const restoredFundPaise = purchased.deductedFundPaise ?? purchased.allocatedPaise;
        const newTotalFund = totalFundPaise + restoredFundPaise;

        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'add_money',
          amountPaise: restoredFundPaise,
          toProductId: product.id,
          toProductName: product.name,
          description: `Restored "${product.name}" back to active products`,
        };

        set({
          totalFundPaise: newTotalFund,
          purchasedProducts: purchasedProducts.filter((p) => p.id !== purchasedId),
          products: [product, ...products],
          transactions: [tx, ...transactions],
          toastMessage: `"${product.name}" restored to active products`,
          toastType: 'success',
        });
      },

      // ── Goals ─────────────────────────────────────────────────────────────

      addGoal(data) {
        const goal: Goal = {
          ...data,
          id: generateId(),
          savedAmountPaise: 0,
          achieved: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          goals: [...state.goals, goal],
          toastMessage: `Goal "${data.name}" created`,
          toastType: 'success',
        }));
      },

      updateGoal(id, data) {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== id) return g;
            const updated = { ...g, ...data };
            const achieved = updated.savedAmountPaise >= updated.targetAmountPaise && updated.targetAmountPaise > 0;
            return {
              ...updated,
              achieved,
              achievedAt: achieved ? (updated.achievedAt ?? new Date().toISOString()) : undefined,
            };
          }),
          toastMessage: 'Goal updated successfully',
          toastType: 'success',
        }));
      },

      deleteGoal(id) {
        const { goals, transactions, saveUndo } = get();
        const goal = goals.find((g) => g.id === id);
        if (!goal) return;
        saveUndo(`Goal "${goal.name}" deleted`);
        // Return any saved amount back to unallocated fund
        const returnedPaise = goal.savedAmountPaise;
        const tx: Transaction | null = returnedPaise > 0 ? {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'goal_withdraw',
          amountPaise: returnedPaise,
          fromProductId: goal.id,
          fromProductName: goal.name,
          description: `Deleted goal "${goal.name}" — ₹${(returnedPaise / 100).toLocaleString('en-IN')} returned to fund`,
        } : null;
        set({
          goals: goals.filter((g) => g.id !== id),
          // Money returns to unallocated (totalFund stays same — goal savings came from it)
          transactions: tx ? [tx, ...transactions] : transactions,
        });
      },

      contributeToGoal(goalId, amountPaise, notes) {
        const state = get();
        const { goals, transactions } = state;
        const goal = goals.find((g) => g.id === goalId);
        if (!goal || amountPaise <= 0) return;

        const summary = selectFundSummary(state);
        if (amountPaise > summary.unallocatedPaise) return;

        const newSaved = goal.savedAmountPaise + amountPaise;
        const achieved = newSaved >= goal.targetAmountPaise && goal.targetAmountPaise > 0;
        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'goal_contribute',
          amountPaise,
          toProductId: goal.id,
          toProductName: goal.name,
          notes,
          description: `Contributed ₹${(amountPaise / 100).toLocaleString('en-IN')} to goal "${goal.name}"`,
        };
        set({
          goals: goals.map((g) =>
            g.id === goalId
              ? { ...g, savedAmountPaise: newSaved, achieved, achievedAt: achieved && !g.achieved ? new Date().toISOString() : g.achievedAt }
              : g
          ),
          transactions: [tx, ...transactions],
          toastMessage: `Contributed ₹${(amountPaise / 100).toLocaleString('en-IN')} to "${goal.name}"`,
          toastType: 'success',
        });
      },

      withdrawFromGoal(goalId, amountPaise, notes) {
        const { goals, transactions } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal || amountPaise <= 0) return;
        const newSaved = Math.max(0, goal.savedAmountPaise - amountPaise);
        const actualAmount = goal.savedAmountPaise - newSaved;
        if (actualAmount <= 0) return;
        const achieved = newSaved >= goal.targetAmountPaise && goal.targetAmountPaise > 0;
        const tx: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          type: 'goal_withdraw',
          amountPaise: actualAmount,
          fromProductId: goal.id,
          fromProductName: goal.name,
          notes,
          description: `Withdrew ₹${(actualAmount / 100).toLocaleString('en-IN')} from goal "${goal.name}" back to fund`,
        };
        set({
          goals: goals.map((g) =>
            g.id === goalId
              ? { ...g, savedAmountPaise: newSaved, achieved, achievedAt: achieved ? g.achievedAt : undefined }
              : g
          ),
          transactions: [tx, ...transactions],
          toastMessage: `Withdrew ₹${(actualAmount / 100).toLocaleString('en-IN')} from "${goal.name}"`,
          toastType: 'success',
        });
      },

      markGoalAchieved(goalId) {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, achieved: true, achievedAt: new Date().toISOString() } : g
          ),
        }));
      },

      // ── Undo ──────────────────────────────────────────────────────────────

      saveUndo(label: string) {
        const { totalFundPaise, products, purchasedProducts, goals, transactions } = get();
        _undoSnapshot = { totalFundPaise, products, purchasedProducts, goals, transactions };
        set({ undoLabel: label });
      },

      undo() {
        if (!_undoSnapshot) return;
        set({ ..._undoSnapshot, undoLabel: '' });
        _undoSnapshot = null;
      },

      clearUndo() {
        _undoSnapshot = null;
        set({ undoLabel: '' });
      },

      // ── Toast notifications ────────────────────────────────────────────────
      showToast(message: string, type: 'success' | 'info' = 'success') {
        set({ toastMessage: message, toastType: type });
      },

      clearToast() {
        set({ toastMessage: '' });
      },

      // ── Data management ───────────────────────────────────────────────────

      restoreFromBackup(data) {
        const sanitized = sanitizeBackupData(data);
        set({
          totalFundPaise: sanitized.totalFundPaise,
          products: sanitized.products,
          purchasedProducts: sanitized.purchasedProducts,
          goals: sanitized.goals,
          transactions: sanitized.transactions,
          undoLabel: '',
        });
        _undoSnapshot = null;
      },

      // ── UI ────────────────────────────────────────────────────────────────

      setDarkMode(val) {
        set({ darkMode: val });
        if (val) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setActiveTab(tab) {
        set({ activeTab: tab });
      },
    }),
    {
      name: 'my-purchase-fund-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        totalFundPaise: state.totalFundPaise,
        products: state.products,
        purchasedProducts: state.purchasedProducts,
        goals: state.goals,
        transactions: state.transactions,
        darkMode: state.darkMode,
        activeTab: state.activeTab,
      }),
    }
  )
);

// ─── Derived Selectors ────────────────────────────────────────────────────────

export function selectFundSummary(state: PurchaseState) {
  const totalAllocatedPaise = state.products.reduce((sum, p) => sum + p.allocatedPaise, 0);
  const totalGoalSavedPaise = (state.goals ?? []).reduce((sum, g) => sum + g.savedAmountPaise, 0);
  const totalCommittedPaise = totalAllocatedPaise + totalGoalSavedPaise;
  const unallocatedPaise = Math.max(0, state.totalFundPaise - totalCommittedPaise);
  const totalRequiredPaise = state.products.reduce((sum, p) => sum + p.pricePaise, 0);
  const remainingRequiredPaise = state.products.reduce(
    (sum, p) => sum + Math.max(0, p.pricePaise - p.allocatedPaise),
    0
  );
  const totalCoveredPaise = state.products.reduce(
    (sum, p) => sum + Math.min(p.allocatedPaise, p.pricePaise),
    0
  );
  const overallProgressPercent =
    totalRequiredPaise === 0
      ? 0
      : Math.min(100, Math.round((totalCoveredPaise / totalRequiredPaise) * 1000) / 10);

  return {
    totalFundPaise: state.totalFundPaise,
    totalAllocatedPaise,
    totalGoalSavedPaise,
    totalCommittedPaise,
    unallocatedPaise,
    totalRequiredPaise,
    remainingRequiredPaise,
    overallProgressPercent,
  };
}
