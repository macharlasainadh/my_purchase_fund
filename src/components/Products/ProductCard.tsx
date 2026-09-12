import React, { useState } from 'react';
import {
  Edit2, Trash2, ExternalLink, ArrowRightLeft, PlusCircle,
  Calendar, Tag, StickyNote, ShoppingCart, AlertCircle,
  MoreVertical
} from 'lucide-react';
import type { Product } from '../../types';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency } from '../../utils/currency';
import { getFundingStatus, getFundingPercent } from '../../utils/allocation';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { formatDateSafe, isPastDate } from '../../utils/date';
import { sanitizeUrl } from '../../utils/url';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { deleteProduct } = usePurchaseStore();
  const { openProductForm, openAddMoney, openMoveMoney, openPurchaseModal } = useModalStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fundingStatus = getFundingStatus(product.allocatedPaise, product.pricePaise);
  const fundingPercent = getFundingPercent(product.allocatedPaise, product.pricePaise);
  const remainingPaise = Math.max(0, product.pricePaise - product.allocatedPaise);
  const excessPaise = Math.max(0, product.allocatedPaise - product.pricePaise);

  const isOverdue = Boolean(
    product.targetDate &&
    isPastDate(product.targetDate) &&
    fundingStatus !== 'fully_funded' &&
    fundingStatus !== 'overfunded'
  );

  const statusBorder: Record<typeof fundingStatus, string> = {
    not_funded: isOverdue ? 'var(--priority-critical-text)' : 'var(--border)',
    partially_funded: isOverdue ? 'var(--priority-critical-text)' : 'var(--status-saving-text)',
    fully_funded: 'var(--status-funded-text)',
    overfunded: 'var(--status-purchased-text)',
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP PRODUCT CARD (100% UNCHANGED, hidden on mobile screens)          */}
      {/* ========================================================================= */}
      <div
        className="hidden sm:flex rounded-2xl flex-col overflow-hidden transition-shadow hover:shadow-md"
        style={{
          backgroundColor: 'var(--surface)',
          border: `1.5px solid ${statusBorder[fundingStatus]}`,
        }}
      >
        {/* Status banner for fully funded / overfunded */}
        {fundingStatus === 'fully_funded' && (
          <div
            className="px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--status-funded-bg)', color: 'var(--status-funded-text)' }}
          >
            ✓ Fully Funded
          </div>
        )}
        {fundingStatus === 'overfunded' && (
          <div
            className="px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--status-purchased-bg)', color: 'var(--status-purchased-text)' }}
          >
            ↑ Overfunded — {formatCurrency(excessPaise)} excess
          </div>
        )}

        {/* Image */}
        {product.imageUrl && (
          <div className="h-36 overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate" style={{ color: 'var(--text)' }}>
                {product.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="priority" priority={product.priority} />
                {isOverdue && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' }}
                  >
                    <AlertCircle size={10} />
                    Overdue
                  </span>
                )}
                {product.category && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' }}
                  >
                    <Tag size={10} />
                    {product.category}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {formatCurrency(product.pricePaise)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>estimated</p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Allocated: {formatCurrency(product.allocatedPaise)}
              </span>
              <span className="text-xs font-bold" style={{ color: fundingPercent >= 100 ? 'var(--accent-free)' : 'var(--accent-allocated)' }}>
                {Math.min(fundingPercent, 100).toFixed(1)}%
              </span>
            </div>
            <ProgressBar allocatedPaise={product.allocatedPaise} pricePaise={product.pricePaise} height="md" />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {remainingPaise > 0 ? `Still need: ${formatCurrency(remainingPaise)}` : '✓ Ready to buy!'}
              </span>
            </div>
          </div>

          {/* Details & Links (Always visible) */}
          {(product.targetDate || product.notes || product.links.length > 0) && (
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              {product.targetDate && (
                <div
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: isOverdue ? 'var(--priority-critical-text)' : 'var(--text-muted)' }}
                >
                  <Calendar size={12} />
                  <span>Target: {formatDateSafe(product.targetDate, 'MMM d, yyyy')}</span>
                  {isOverdue && <span className="font-semibold">(Past due)</span>}
                </div>
              )}

              {product.notes && (
                <div className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{product.notes}</span>
                </div>
              )}

              {product.links.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {product.links.map((link) => (
                    <a
                      key={link.id}
                      href={sanitizeUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      <ExternalLink size={10} />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => openAddMoney(product)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              <PlusCircle size={12} />
              Add Money
            </button>
            <button
              onClick={() => openMoveMoney(product)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <ArrowRightLeft size={12} />
              Move
            </button>
            {(fundingStatus === 'fully_funded' || fundingStatus === 'overfunded') && (
              <button
                onClick={() => openPurchaseModal(product)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                <ShoppingCart size={12} />
                Mark Purchased
              </button>
            )}
            <button
              onClick={() => openProductForm(product)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <Edit2 size={12} />
              Edit
            </button>
            <button
              onClick={() => deleteProduct(product.id)}
              title="Delete product (can be undone)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE APP PRODUCT CARD (Bespoke native mobile design, sm:hidden)        */}
      {/* ========================================================================= */}
      <div
        className="sm:hidden rounded-2xl flex flex-col overflow-hidden shadow-sm relative transition-all"
        style={{
          backgroundColor: 'var(--surface)',
          border: `1.5px solid ${statusBorder[fundingStatus]}`,
        }}
      >
        {/* Status banner for fully funded / overfunded */}
        {fundingStatus === 'fully_funded' && (
          <div
            className="px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--status-funded-bg)', color: 'var(--status-funded-text)' }}
          >
            ✓ Ready to Purchase (Fully Funded)
          </div>
        )}
        {fundingStatus === 'overfunded' && (
          <div
            className="px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-1.5"
            style={{ backgroundColor: 'var(--status-purchased-bg)', color: 'var(--status-purchased-text)' }}
          >
            ↑ Overfunded — {formatCurrency(excessPaise)} extra
          </div>
        )}

        {/* Product Image if present */}
        {product.imageUrl && (
          <div className="h-40 overflow-hidden relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white drop-shadow">
              <span className="text-lg font-bold">{formatCurrency(product.pricePaise)}</span>
              <span className="text-xs bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium">Estimated</span>
            </div>
          </div>
        )}

        <div className="p-4 flex flex-col gap-3">
          {/* Header Row: Title + Tags on Left, Price (if no image) + More Menu on Right */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-snug break-words" style={{ color: 'var(--text)' }}>
                {product.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="priority" priority={product.priority} />
                {isOverdue && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: 'var(--priority-critical-bg)', color: 'var(--priority-critical-text)' }}
                  >
                    <AlertCircle size={10} />
                    Overdue
                  </span>
                )}
                {product.category && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' }}
                  >
                    <Tag size={10} />
                    {product.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!product.imageUrl && (
                <div className="text-right mr-1">
                  <p className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                    {formatCurrency(product.pricePaise)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target</p>
                </div>
              )}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors active:bg-[var(--surface-2)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label="More options"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* 3-dot dropdown popup menu for mobile */}
          {showMobileMenu && (
            <>
              <div
                className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px]"
                onClick={() => setShowMobileMenu(false)}
              />
              <div
                className="absolute right-3 top-14 z-40 w-52 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => { setShowMobileMenu(false); openProductForm(product); }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all text-left"
                  style={{ color: 'var(--text)' }}
                >
                  <Edit2 size={15} style={{ color: 'var(--text-muted)' }} />
                  <span>Edit Product</span>
                </button>
                <button
                  onClick={() => { setShowMobileMenu(false); openMoveMoney(product); }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all text-left"
                  style={{ color: 'var(--text)' }}
                >
                  <ArrowRightLeft size={15} style={{ color: 'var(--text-muted)' }} />
                  <span>Move Allocated Money</span>
                </button>
                {product.links.length > 0 && product.links.map((link) => (
                  <a
                    key={link.id}
                    href={sanitizeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all text-left truncate"
                    style={{ color: 'var(--text)' }}
                  >
                    <ExternalLink size={15} style={{ color: 'var(--text-muted)' }} />
                    <span className="truncate">{link.label}</span>
                  </a>
                ))}
                <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                <button
                  onClick={() => { setShowMobileMenu(false); deleteProduct(product.id); }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 active:scale-[0.98] transition-all text-left"
                >
                  <Trash2 size={15} />
                  <span>Delete Product</span>
                </button>
              </div>
            </>
          )}

          {/* 2-Column Metrics Box */}
          <div
            className="grid grid-cols-2 gap-2 p-2.5 rounded-xl"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Allocated
              </p>
              <p className="text-base font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--accent-allocated)' }}>
                {formatCurrency(product.allocatedPaise)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                {remainingPaise > 0 ? 'Remaining' : 'Status'}
              </p>
              <p
                className="text-base font-extrabold tracking-tight mt-0.5"
                style={{ color: remainingPaise > 0 ? 'var(--text)' : 'var(--accent-free)' }}
              >
                {remainingPaise > 0 ? formatCurrency(remainingPaise) : 'Ready to buy!'}
              </p>
            </div>
          </div>

          {/* Progress Bar with Single Percent */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Funding Progress</span>
              <span
                className="font-bold text-xs"
                style={{ color: fundingPercent >= 100 ? 'var(--accent-free)' : 'var(--accent-allocated)' }}
              >
                {Math.min(fundingPercent, 100).toFixed(1)}%
              </span>
            </div>
            <ProgressBar allocatedPaise={product.allocatedPaise} pricePaise={product.pricePaise} height="md" />
          </div>

          {/* Target Date / Notes */}
          {(product.targetDate || product.notes) && (
            <div className="flex flex-col gap-1.5 pt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {product.targetDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="flex-shrink-0" />
                  <span>Target: {formatDateSafe(product.targetDate, 'MMM d, yyyy')}</span>
                  {isOverdue && <span className="font-bold text-rose-500">(Past due)</span>}
                </div>
              )}
              {product.notes && (
                <div className="flex items-start gap-1.5">
                  <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{product.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile Action Buttons (>= 44px touch height) */}
          <div className="pt-2 border-t mt-auto flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            {(fundingStatus === 'fully_funded' || fundingStatus === 'overfunded') ? (
              <button
                onClick={() => openPurchaseModal(product)}
                className="flex-1 h-11 min-h-[44px] rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingCart size={16} />
                <span>Mark Purchased</span>
              </button>
            ) : (
              <button
                onClick={() => openAddMoney(product)}
                className="flex-1 h-11 min-h-[44px] rounded-xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle size={16} />
                <span>Add Money</span>
              </button>
            )}

            <button
              onClick={() => openMoveMoney(product)}
              className="h-11 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border active:scale-[0.98] transition-all"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
              title="Move Money"
            >
              <ArrowRightLeft size={14} />
              <span>Move</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
