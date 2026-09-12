import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useModalStore } from '../../store/useModalStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { rupeesToPaise, paiseToRupees } from '../../utils/currency';
import { generateId } from '../../utils/allocation';
import { isSafeHttpUrl, normalizeUrl } from '../../utils/url';
import type { Priority, ProductLink } from '../../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const CATEGORIES = [
  'Electronics', 'Computers', 'Audio', 'Mobile', 'Gaming', 'Home Appliances',
  'Fashion', 'Books', 'Sports', 'Furniture', 'Tools', 'Other',
];

export function ProductFormModal() {
  const { productFormOpen, productFormEditTarget, closeProductForm } = useModalStore();
  const { addProduct, updateProduct } = usePurchaseStore();

  const isEdit = !!productFormEditTarget;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [links, setLinks] = useState<ProductLink[]>([{ id: generateId(), label: 'Amazon', url: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productFormEditTarget) {
      setName(productFormEditTarget.name);
      setCategory(CATEGORIES.includes(productFormEditTarget.category) ? productFormEditTarget.category : 'Other');
      setCustomCategory(CATEGORIES.includes(productFormEditTarget.category) ? '' : productFormEditTarget.category);
      setPrice(String(paiseToRupees(productFormEditTarget.pricePaise)));
      setPriority(productFormEditTarget.priority);
      setNotes(productFormEditTarget.notes ?? '');
      setImageUrl(productFormEditTarget.imageUrl ?? '');
      setTargetDate(productFormEditTarget.targetDate ?? '');
      setLinks(productFormEditTarget.links.length > 0 ? productFormEditTarget.links : [{ id: generateId(), label: 'Amazon', url: '' }]);
    } else {
      setName(''); setCategory(''); setCustomCategory(''); setPrice('');
      setPriority('medium'); setNotes(''); setImageUrl(''); setTargetDate('');
      setLinks([{ id: generateId(), label: 'Amazon', url: '' }]);
    }
    setErrors({});
  }, [productFormEditTarget, productFormOpen]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) errs.price = 'Enter a valid price greater than 0';
    // validate links
    links.forEach((l, i) => {
      const trimmedUrl = l.url.trim();
      if (trimmedUrl) {
        if (!l.label.trim()) errs[`link_label_${i}`] = 'Link label is required';
        if (!isSafeHttpUrl(trimmedUrl)) {
          errs[`link_url_${i}`] = 'Please enter a valid web link (http:// or https://)';
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const finalCategory = category === 'Other' || !CATEGORIES.includes(category) ? customCategory || 'Other' : category;
    const validLinks = links
      .filter((l) => l.url.trim() && isSafeHttpUrl(l.url.trim()))
      .map((l) => ({
        ...l,
        label: l.label.trim() || 'Link',
        url: normalizeUrl(l.url),
      }));
    const pricePaise = rupeesToPaise(parseFloat(price));

    if (isEdit && productFormEditTarget) {
      updateProduct(productFormEditTarget.id, {
        name: name.trim(),
        category: finalCategory,
        pricePaise,
        priority,
        notes: notes.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        targetDate: targetDate || undefined,
        links: validLinks,
      });
    } else {
      addProduct({
        name: name.trim(),
        category: finalCategory,
        pricePaise,
        priority,
        notes: notes.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        targetDate: targetDate || undefined,
        links: validLinks,
      });
    }
    closeProductForm();
  }

  function addLink() {
    setLinks([...links, { id: generateId(), label: '', url: '' }]);
  }

  function updateLink(id: string, field: 'label' | 'url', value: string) {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function removeLink(id: string) {
    setLinks(links.filter((l) => l.id !== id));
  }

  const inputStyle = {
    backgroundColor: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <Modal
      isOpen={productFormOpen}
      onClose={closeProductForm}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      size="lg"
      footer={
        <>
          <button onClick={closeProductForm}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors">
            {isEdit ? 'Save Changes' : 'Save Product'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Name */}
        <Field label="Product Name *" error={errors.name}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sony WH-1000XM6"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {category === 'Other' && (
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name" className="w-full mt-2 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            )}
          </Field>

          {/* Priority */}
          <Field label="Priority">
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    priority === p ? 'text-white' : ''
                  }`}
                  style={priority === p
                    ? { backgroundColor: p === 'critical' ? '#ef4444' : p === 'high' ? '#f97316' : p === 'medium' ? '#0ea5e9' : '#94a3b8' }
                    : { border: '1px solid var(--border)', color: 'var(--text-muted)' }
                  }>
                  {p}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <Field label="Estimated Price (₹) *" error={errors.price}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="0" min="0" step="0.01"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </Field>

          {/* Target Date */}
          <Field label="Target Purchase Date">
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </Field>
        </div>

        {/* Image URL */}
        <Field label="Product Image URL (optional)">
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          {imageUrl && (
            <div className="mt-2 h-20 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </Field>

        {/* Notes */}
        <Field label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Wait for sale, check reviews first..."
            rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
        </Field>

        {/* Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Shopping Links</label>
            <button onClick={addLink} className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 font-medium cursor-pointer">
              <Plus size={13} /> Add Another Link
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {links.map((link, i) => (
              <div key={link.id} className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input type="text" value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                    placeholder="Label (e.g. Amazon)"
                    className="w-full sm:w-32 px-3 py-2 rounded-xl text-sm outline-none flex-shrink-0" style={inputStyle} />
                  <div className="flex gap-2 items-center flex-1">
                    <input type="url" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
                    <button onClick={() => removeLink(link.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0 cursor-pointer"
                      title="Remove link">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {(errors[`link_label_${i}`] || errors[`link_url_${i}`]) && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors[`link_label_${i}`] || errors[`link_url_${i}`]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text)' }}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
