import { formatDateSafe } from '../../utils/date';
import { sanitizeUrl } from '../../utils/url';
import { ExternalLink, ShoppingBag, Tag, Calendar, RotateCcw } from 'lucide-react';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../ui/Badge';

export function PurchasedSection() {
  const { purchasedProducts, setActiveTab, restorePurchasedProduct } = usePurchaseStore();

  if (purchasedProducts.length === 0) {
    return (
      <div className="mt-3 sm:mt-6 py-6 sm:py-12 px-4 flex flex-col items-center rounded-2xl"
           style={{ border: '1.5px dashed var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
             style={{ backgroundColor: 'var(--surface-2)' }}>
          <ShoppingBag size={20} style={{ color: 'var(--text-subtle)' }} />
        </div>
        <h3 className="text-sm sm:text-base font-bold mb-0.5 text-center" style={{ color: 'var(--text)' }}>No purchased products yet</h3>
        <p className="text-xs mb-3 text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
          When you mark a product as purchased, it will appear here with its purchase history.
        </p>
        <button
          onClick={() => setActiveTab('products')}
          className="h-10 min-h-[40px] flex items-center gap-1.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          View Active Products
        </button>
      </div>
    );
  }

  const totalSpentPaise = purchasedProducts.reduce((s, p) => s + p.finalPricePaise, 0);

  return (
    <div className="mt-4 sm:mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Purchased Products</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {purchasedProducts.length} item{purchasedProducts.length !== 1 ? 's' : ''} acquired
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total Spent</p>
          <p className="text-base font-extrabold text-emerald-600">{formatCurrency(totalSpentPaise)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {purchasedProducts.map((p) => {
          const savings = p.originalPricePaise - p.finalPricePaise;
          return (
            <div key={p.id}
                 className="rounded-2xl overflow-hidden"
                 style={{ border: '1.5px solid #6ee7b7', backgroundColor: 'var(--surface)' }}>
              {/* Purchased banner */}
              <div
                className="px-4 py-1.5 text-xs font-semibold text-center"
                style={{ backgroundColor: 'var(--status-funded-bg)', color: 'var(--status-funded-text)' }}
              >
                ✔ Purchased · {formatDateSafe(p.purchasedAt, 'MMM d, yyyy')}
              </div>

              {p.imageUrl && (
                <div className="h-32 overflow-hidden">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{p.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge variant="priority" priority={p.priority} />
                    {p.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' }}>
                        <Tag size={10} />
                        {p.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Final Price</p>
                    <p className="text-base font-bold text-emerald-600">{formatCurrency(p.finalPricePaise)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Estimated</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{formatCurrency(p.originalPricePaise)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allocated</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{formatCurrency(p.allocatedPaise)}</p>
                  </div>
                  {savings !== 0 && (
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Savings</p>
                      <p className={`text-sm font-semibold ${savings > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {savings > 0 ? '-' : '+'}{formatCurrency(Math.abs(savings))}
                      </p>
                    </div>
                  )}
                </div>

                {p.targetDate && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={11} />
                    Target was: {formatDateSafe(p.targetDate, 'MMM d, yyyy')}
                  </div>
                )}

                {p.notes && (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{p.notes}</p>
                )}

                {p.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.links.map((link) => (
                      <a key={link.id} href={sanitizeUrl(link.url)} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs transition-colors hover:opacity-80"
                         style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        <ExternalLink size={9} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Card actions */}
                <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => restorePurchasedProduct(p.id)}
                    className="h-10 min-h-[40px] sm:h-auto sm:py-1.5 flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer"
                    style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    title="Move back to active products"
                  >
                    <RotateCcw size={13} />
                    Move to Active
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
