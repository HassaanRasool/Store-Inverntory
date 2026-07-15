'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Tag, Layers, DollarSign, AlertTriangle } from 'lucide-react';
import { DatabaseService, Item, Category } from '@/lib/database';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  itemToEdit?: Item | null;
}

export default function ItemModal({ isOpen, onClose, onSave, itemToEdit }: ItemModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [price, setPrice] = useState<number>(0);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await DatabaseService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setSku(itemToEdit.sku || '');
      setDescription(itemToEdit.description || '');
      setQuantity(itemToEdit.quantity);
      setMinQuantity(itemToEdit.min_quantity);
      setPrice(itemToEdit.price);
      setCategoryIds(itemToEdit.category_ids || []);
    } else {
      setName('');
      setSku('');
      setDescription('');
      setQuantity(0);
      setMinQuantity(5);
      setPrice(0);
      setCategoryIds([]);
    }
    setShowAddCategory(false);
    setNewCategoryName('');
    setError('');
  }, [itemToEdit, isOpen]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await DatabaseService.addCategory(newCategoryName.trim());
      setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryIds(prev => [...prev, newCat.id]);
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    }
  };

  const toggleCategory = (catId: string) => {
    setCategoryIds(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (price < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    if (minQuantity < 0) {
      setError('Minimum warning level cannot be negative');
      return;
    }

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        // Edit flow
        await DatabaseService.updateItem(itemToEdit.id, {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          quantity,
          min_quantity: minQuantity,
          price,
          category_ids: categoryIds
        });
      } else {
        // Create flow
        await DatabaseService.addItem({
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          quantity,
          min_quantity: minQuantity,
          price,
          category_ids: categoryIds
        });
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Backdrop clickable area */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Modal Container */}
      <div 
        className="w-full max-h-[92vh] sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-150 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {itemToEdit ? 'Edit Stock Item' : 'Create New Item'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {itemToEdit ? 'Update details of your inventory item' : 'Add a new product or inventory asset'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="item-name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wire No 12, LED Bulb"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* SKU Field */}
          <div>
            <label htmlFor="item-sku" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              SKU / Barcode <span className="text-zinc-400 text-xs font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Layers className="w-4 h-4" />
              </div>
              <input
                id="item-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SKU-10042"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Categories <span className="text-zinc-400 text-xs font-normal">(Select multiple)</span>
              </label>
              {!showAddCategory && (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-750 dark:text-blue-400 cursor-pointer"
                >
                  + Create New Category
                </button>
              )}
            </div>

            {showAddCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name (e.g. Capacitor 2.5uF)"
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-3 bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-355 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[48px] items-center bg-zinc-50/50 dark:bg-zinc-950/20">
                {categories.length === 0 ? (
                  <p className="text-xs text-zinc-450 dark:text-zinc-505 italic px-2">No categories created yet. Click "+ Create New Category" to start.</p>
                ) : (
                  categories.map((cat) => {
                    const isSelected = categoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-600 text-white border border-blue-600 shadow-sm shadow-blue-500/25'
                            : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <span className="text-[10px] font-black">✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="item-desc" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description <span className="text-zinc-400 text-xs font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-zinc-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="item-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about raw material, supplier, or location..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Price Field */}
          <div>
            <label htmlFor="item-price" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Unit Price (Rs. / PKR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Quantities (Grid of 2) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-qty" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Current Stock Quantity
              </label>
              <input
                id="item-qty"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
                disabled={!!itemToEdit}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
              />
              {itemToEdit && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                  Adjust stock using direct +/- triggers.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="item-min-qty" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Low Stock Threshold
              </label>
              <input
                id="item-min-qty"
                type="number"
                min="0"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                placeholder="5"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 transition-all shadow-md shadow-blue-550/20 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : itemToEdit ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
