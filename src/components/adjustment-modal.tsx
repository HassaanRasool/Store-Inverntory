'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Info, Save, AlertTriangle } from 'lucide-react';
import { DatabaseService, Item } from '@/lib/database';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item: Item | null;
  initialType?: 'add' | 'subtract';
}

export default function AdjustmentModal({ isOpen, onClose, onSave, item, initialType = 'add' }: AdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>(initialType);
  const [qtyChange, setQtyChange] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAdjustmentType(initialType);
    setQtyChange(1);
    setNotes('');
    setError('');
  }, [item, isOpen, initialType]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (qtyChange <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    if (adjustmentType === 'subtract' && item.quantity < qtyChange) {
      setError(`Cannot subtract more stock than available. Current stock: ${item.quantity}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalChange = adjustmentType === 'add' ? qtyChange : -qtyChange;
      const formattedNotes = notes.trim() || (adjustmentType === 'add' ? 'Manual stock intake' : 'Manual stock deduction');
      
      await DatabaseService.adjustStock(item.id, finalChange, formattedNotes);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during adjustment.');
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
        className="w-full max-h-[92vh] sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-150 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Adjust Stock</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Modify stock levels for <strong className="text-zinc-700 dark:text-zinc-300">{item.name}</strong>
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

          {/* Current Stock info */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Quantity</span>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">{item.quantity} pcs</span>
          </div>

          {/* Adjustment Toggle */}
          <div>
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Adjustment Type</span>
            <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-2xl">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  adjustmentType === 'subtract'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Deduct Stock
              </button>
            </div>
          </div>

          {/* Quantity Field */}
          <div>
            <label htmlFor="adjust-qty" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Quantity to {adjustmentType === 'add' ? 'Add' : 'Deduct'}
            </label>
            <input
              id="adjust-qty"
              type="number"
              min="1"
              value={qtyChange}
              onChange={(e) => setQtyChange(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-semibold"
              required
            />
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="adjust-notes" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Adjustment Notes <span className="text-zinc-400 text-xs font-normal">(Auditing Reason)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none text-zinc-400">
                <Info className="w-4 h-4" />
              </div>
              <textarea
                id="adjust-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={adjustmentType === 'add' ? 'e.g. Received shipment from supplier' : 'e.g. Sales, Damaged goods, Gift'}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
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
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all shadow-md active:scale-[0.98] ${
              adjustmentType === 'add' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-550/20' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-550/20'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Adjusting...' : 'Save Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
}
