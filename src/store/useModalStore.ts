import { create } from 'zustand';
import type { Product } from '../types';

// ─── Modal Store ─────────────────────────────────────────────────────────────
// Centralized modal open/close state to avoid prop drilling

interface ModalState {
  // Add Money Modal
  addMoneyOpen: boolean;
  addMoneyTargetProduct: Product | null;

  // Product Form Modal
  productFormOpen: boolean;
  productFormEditTarget: Product | null;

  // Move Money Modal
  moveMoneyOpen: boolean;
  moveMoneySourceProduct: Product | null;

  // Redistribute Modal
  redistributeOpen: boolean;

  // Equal Distribute Modal
  equalDistributeOpen: boolean;

  // Goal modals
  goalFormOpen: boolean;
  goalFormEditTarget: import('../types').Goal | null;
  goalContributeOpen: boolean;
  goalContributeTarget: import('../types').Goal | null;

  // Purchase Modal (Global Singleton)
  purchaseModalOpen: boolean;
  purchaseModalProduct: Product | null;

  // Confirm Modal
  confirmOpen: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmOnConfirm: (() => void) | null;

  // Actions
  openAddMoney: (targetProduct?: Product) => void;
  closeAddMoney: () => void;
  openProductForm: (editTarget?: Product) => void;
  closeProductForm: () => void;
  openMoveMoney: (sourceProduct?: Product) => void;
  closeMoveMoney: () => void;
  openRedistribute: () => void;
  closeRedistribute: () => void;
  openEqualDistribute: () => void;
  closeEqualDistribute: () => void;
  openGoalForm: (editTarget?: import('../types').Goal) => void;
  closeGoalForm: () => void;
  openGoalContribute: (goal: import('../types').Goal) => void;
  closeGoalContribute: () => void;
  openPurchaseModal: (product: Product) => void;
  closePurchaseModal: () => void;
  dataManagementOpen: boolean;
  openDataManagement: () => void;
  closeDataManagement: () => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  addMoneyOpen: false,
  addMoneyTargetProduct: null,
  productFormOpen: false,
  productFormEditTarget: null,
  moveMoneyOpen: false,
  moveMoneySourceProduct: null,
  redistributeOpen: false,
  equalDistributeOpen: false,
  goalFormOpen: false,
  goalFormEditTarget: null,
  goalContributeOpen: false,
  goalContributeTarget: null,
  purchaseModalOpen: false,
  purchaseModalProduct: null,
  confirmOpen: false,
  confirmTitle: '',
  confirmMessage: '',
  confirmOnConfirm: null,

  openAddMoney: (targetProduct) => set({ addMoneyOpen: true, addMoneyTargetProduct: targetProduct ?? null }),
  closeAddMoney: () => set({ addMoneyOpen: false, addMoneyTargetProduct: null }),
  openProductForm: (editTarget) => set({ productFormOpen: true, productFormEditTarget: editTarget ?? null }),
  closeProductForm: () => set({ productFormOpen: false, productFormEditTarget: null }),
  openMoveMoney: (sourceProduct) => set({ moveMoneyOpen: true, moveMoneySourceProduct: sourceProduct ?? null }),
  closeMoveMoney: () => set({ moveMoneyOpen: false, moveMoneySourceProduct: null }),
  openRedistribute: () => set({ redistributeOpen: true }),
  closeRedistribute: () => set({ redistributeOpen: false }),
  openEqualDistribute: () => set({ equalDistributeOpen: true }),
  closeEqualDistribute: () => set({ equalDistributeOpen: false }),
  openGoalForm: (editTarget) => set({ goalFormOpen: true, goalFormEditTarget: editTarget ?? null }),
  closeGoalForm: () => set({ goalFormOpen: false, goalFormEditTarget: null }),
  openGoalContribute: (goal) => set({ goalContributeOpen: true, goalContributeTarget: goal }),
  closeGoalContribute: () => set({ goalContributeOpen: false, goalContributeTarget: null }),
  openPurchaseModal: (product) => set({ purchaseModalOpen: true, purchaseModalProduct: product }),
  closePurchaseModal: () => set({ purchaseModalOpen: false, purchaseModalProduct: null }),
  dataManagementOpen: false,
  openDataManagement: () => set({ dataManagementOpen: true }),
  closeDataManagement: () => set({ dataManagementOpen: false }),
  openConfirm: (title, message, onConfirm) => set({ confirmOpen: true, confirmTitle: title, confirmMessage: message, confirmOnConfirm: onConfirm }),
  closeConfirm: () => set({ confirmOpen: false, confirmOnConfirm: null }),
}));
