import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Package, PlusCircle } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { ProductCard } from './ProductCard';
import { AllocationChart } from '../Dashboard/AllocationChart';
import type { Product, Priority, FundingStatus } from '../../types';
import { getFundingStatus, getFundingPercent } from '../../utils/allocation';

type SortKey = 'name' | 'price' | 'funding_pct' | 'remaining' | 'priority' | 'target_date' | 'created_at';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function ProductGrid() {
  const { products } = usePurchaseStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterFunding, setFilterFunding] = useState<FundingStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.notes ?? '').toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterCategory) list = list.filter((p) => p.category === filterCategory);
    if (filterPriority) list = list.filter((p) => p.priority === filterPriority);
    if (filterFunding) {
      list = list.filter((p) => getFundingStatus(p.allocatedPaise, p.pricePaise) === filterFunding);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'price': cmp = a.pricePaise - b.pricePaise; break;
        case 'funding_pct':
          cmp = getFundingPercent(a.allocatedPaise, a.pricePaise) - getFundingPercent(b.allocatedPaise, b.pricePaise);
          break;
        case 'remaining': cmp = (a.pricePaise - a.allocatedPaise) - (b.pricePaise - b.allocatedPaise); break;
        case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break;
        case 'target_date':
          cmp = (a.targetDate ?? '').localeCompare(b.targetDate ?? '');
          break;
        case 'created_at': cmp = a.createdAt.localeCompare(b.createdAt); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [products, search, sortKey, sortDir, filterCategory, filterPriority, filterFunding]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const { openProductForm } = useModalStore();

  if (products.length === 0) {
    return (
      <div className="mt-3 sm:mt-6 flex flex-col items-center justify-center py-6 sm:py-12 px-4 rounded-2xl"
           style={{ border: '1.5px dashed var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
             style={{ backgroundColor: 'var(--surface-2)' }}>
          <Package size={22} style={{ color: 'var(--accent-allocated)' }} />
        </div>
        <h3 className="text-sm sm:text-base font-bold mb-0.5 text-center" style={{ color: 'var(--text)' }}>No products yet</h3>
        <p className="text-xs text-center max-w-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Add your first product to start planning your purchases and allocating your fund.
        </p>
        <button
          onClick={() => openProductForm()}
          className="h-10 min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle size={15} />
          Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Allocation Chart */}
      <AllocationChart />

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search products, categories, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-11 sm:h-auto sm:py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 min-h-[44px] sm:h-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' : ''}`}
          style={!showFilters ? { border: '1.5px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface)' } : { border: '1.5px solid #bae6fd' }}
        >
          <SlidersHorizontal size={15} />
          Filters & Sort
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
             style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Sort */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Sort by</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="created_at">Recently Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="funding_pct">Funding %</option>
              <option value="remaining">Remaining</option>
              <option value="priority">Priority</option>
              <option value="target_date">Target Date</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Direction</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDir)}
              className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Funding Status</label>
            <select
              value={filterFunding}
              onChange={(e) => setFilterFunding(e.target.value as FundingStatus | '')}
              className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="">All Statuses</option>
              <option value="not_funded">Not Funded</option>
              <option value="partially_funded">Partially Funded</option>
              <option value="fully_funded">Fully Funded</option>
              <option value="overfunded">Overfunded</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | '')}
              className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
              style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilterCategory(''); setFilterPriority(''); setFilterFunding(''); setSearch(''); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results info */}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Showing {filteredAndSorted.length} of {products.length} products
      </p>

      {/* Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          No products match your search or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
