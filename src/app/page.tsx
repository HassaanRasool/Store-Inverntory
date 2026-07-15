'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Minus,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Edit,
  Trash2,
  History,
  Layers,
  PlusCircle,
  MinusCircle,
  Database,
  Printer,
  Upload,
  Download,
  Shield,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { DatabaseService, Item, Transaction, Category } from '@/lib/database';
import ItemModal from '@/components/item-modal';
import AdjustmentModal from '@/components/adjustment-modal';
import LoginScreen from '@/components/login-screen';
import SecurityModal from '@/components/security-modal';
import { useTheme } from '@/components/theme-provider';

interface RateListRowProps {
  item: Item;
  index: number;
  categories: Category[];
  onSave: () => void;
  onEditDetails: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function RateListRow({ item, index, categories, onSave, onEditDetails, onDelete }: RateListRowProps) {
  const [price, setPrice] = useState<string>(item.price.toString());
  const [prevPrice, setPrevPrice] = useState<number>(item.price);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(false);
  const [calcQty, setCalcQty] = useState<string>('');

  const numPrice = parseFloat(price) || item.price;
  const numCalcQty = parseFloat(calcQty);
  const totalPrice = !isNaN(numCalcQty) && numCalcQty > 0 ? numPrice * numCalcQty : null;

  if (item.price !== prevPrice) {
    setPrice(item.price.toString());
    setPrevPrice(item.price);
  }

  const handleBlurOrEnter = async () => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setPrice(item.price.toString());
      return;
    }
    if (numPrice === item.price) return;

    setIsSaving(true);
    setError(false);
    try {
      await DatabaseService.updateItem(item.id, { price: numPrice });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      onSave();
    } catch (err) {
      console.error("Failed to update price:", err);
      setError(true);
      setPrice(item.price.toString());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors border-b border-zinc-250 dark:border-zinc-800/85">
      <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-zinc-400 dark:text-zinc-550 text-xs w-16">{index + 1}</td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 max-w-xs md:max-w-md truncate">
        <div className="font-bold text-zinc-900 dark:text-white">{item.name}</div>
        {item.category_ids && item.category_ids.map(catId => {
          const cat = categories.find(c => c.id === catId);
          if (!cat) return null;
          return (
            <span key={catId} className="text-[9px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 px-1.5 py-0.5 rounded-md text-blue-600 dark:text-blue-400 font-bold inline-block uppercase mt-1 mr-1">
              {cat.name}
            </span>
          );
        })}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">{item.sku || '—'}</td>
      <td className="px-3 sm:px-6 py-3 sm:py-4">
        {/* Print-only static text */}
        <span className="hidden print:inline font-bold text-zinc-950">
          Rs. {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>

        {/* Screen-only interactive input */}
        <div className="print:hidden flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Rs.</span>
          <div className="relative">
            <input
              type="number"
              value={price}
              step="0.01"
              min="0"
              onChange={(e) => setPrice(e.target.value)}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className={`w-28 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border ${error
                ? 'border-rose-500 focus:ring-rose-500'
                : isSaved
                  ? 'border-emerald-500 focus:ring-emerald-500'
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500'
                } rounded-xl text-sm font-bold focus:outline-none focus:ring-2 text-zinc-900 dark:text-white transition-all`}
            />
          </div>
          {isSaving && <span className="text-xs text-zinc-400 animate-pulse">Saving...</span>}
          {isSaved && <span className="text-xs text-emerald-600 dark:text-emerald-450 font-bold">Saved!</span>}
        </div>
      </td>
      {/* Qty × Price calculator */}
      <td className="px-3 sm:px-6 py-3 sm:py-4 print:hidden">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Qty"
            value={calcQty}
            onChange={(e) => setCalcQty(e.target.value)}
            className="w-20 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900 dark:text-white transition-all placeholder-zinc-400"
          />
          {totalPrice !== null ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Total</span>
              <span className="text-sm font-black text-violet-600 dark:text-violet-400 whitespace-nowrap">
                Rs. {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-350 dark:text-zinc-600">—</span>
          )}
        </div>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 print:hidden text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEditDetails(item)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-850 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
            title="Edit details"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Home() {
  // SSR hydration safety
  const [mounted, setMounted] = useState(false);

  // Data States
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('store_authenticated') === 'true';
    }
    return false;
  });
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Theme State using our custom ThemeProvider
  const { theme, toggleTheme } = useTheme();

  // UI Control States
  const [activeTab, setActiveTab] = useState<'inventory' | 'rates' | 'history'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [rateSearchQuery, setRateSearchQuery] = useState('');
  const [rateSortType, setRateSortType] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('name-asc');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Memoized filter helper lists to keep item categories separate
  const uniqueItemNames = React.useMemo(() => {
    return Array.from(new Set(items.map(item => item.name))).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const availableCategoriesForFilter = React.useMemo(() => {
    if (selectedItemFilter === 'all') {
      return categories;
    }
    // Find all items matching selectedItemFilter
    const matchingItems = items.filter(item => item.name === selectedItemFilter);
    // Gather all category IDs from these items
    const catIds = new Set<string>();
    matchingItems.forEach(item => {
      if (item.category_ids) {
        item.category_ids.forEach(id => catIds.add(id));
      }
    });
    // Filter categories state list
    return categories.filter(cat => catIds.has(cat.id));
  }, [selectedItemFilter, categories, items]);

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<Item | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<Item | null>(null);
  const [adjustModalType, setAdjustModalType] = useState<'add' | 'subtract'>('add');

  // Fetch all data
  const loadData = async () => {
    try {
      await DatabaseService.init();
      const loadedItems = await DatabaseService.getItems();
      const loadedTxs = await DatabaseService.getTransactions();
      const loadedCats = await DatabaseService.getCategories();
      setItems(loadedItems);
      setTransactions(loadedTxs);
      setCategories(loadedCats);
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(handle);
    };
  }, []);

  // Export all items to CSV file
  const handleExportCSV = () => {
    try {
      if (items.length === 0) {
        alert("Your inventory database is currently empty. There is nothing to export.");
        return;
      }

      const headers = ['id', 'name', 'sku', 'description', 'quantity', 'min_quantity', 'price', 'category_name'];
      const rows = items.map(item => {
        const catNames = item.category_ids
          ? item.category_ids.map(cid => categories.find(c => c.id === cid)?.name).filter(Boolean).join(';')
          : '';
        return [
          item.id,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${(item.sku || '').replace(/"/g, '""')}"`,
          `"${(item.description || '').replace(/"/g, '""')}"`,
          item.quantity,
          item.min_quantity,
          item.price,
          `"${catNames.replace(/"/g, '""')}"`
        ];
      });
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `store_database_backup_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export database:", err);
      alert("An error occurred while exporting the database backup.");
    }
  };

  // Robust CSV parser state machine
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal);
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        row.push(currentVal);
        lines.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal);
      lines.push(row);
    }
    return lines;
  };

  // Import items from CSV file
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        alert("Failed to read CSV file content or file is empty.");
        return;
      }

      try {
        const parsedLines = parseCSV(text);
        if (parsedLines.length < 2) {
          alert("CSV file seems to be empty or does not have data rows.");
          return;
        }

        const headers = parsedLines[0].map(h => h.trim().toLowerCase());
        const idIdx = headers.indexOf('id');
        const nameIdx = headers.indexOf('name');
        const skuIdx = headers.indexOf('sku');
        const descIdx = headers.indexOf('description');
        const qtyIdx = headers.indexOf('quantity');
        const minQtyIdx = headers.indexOf('min_quantity');
        const priceIdx = headers.indexOf('price');
        const categoryNameIdx = headers.indexOf('category_name');

        if (nameIdx === -1) {
          alert("Invalid CSV format! The file must contain a 'name' column.");
          return;
        }

        const importedItems: Array<{
          id?: string;
          name: string;
          sku: string;
          description: string;
          quantity: number;
          min_quantity: number;
          price: number;
          category_ids?: string[];
        }> = [];

        // Cache local copy of categories to avoid repeated duplicate creations during import
        const currentCats = [...categories];

        for (let i = 1; i < parsedLines.length; i++) {
          const row = parsedLines[i];
          if (row.length === 1 && row[0].trim() === '') continue; // skip empty line

          const name = row[nameIdx]?.trim();
          if (!name) continue; // Skip rows with blank names

          const id = idIdx !== -1 && row[idIdx]?.trim() ? row[idIdx].trim() : undefined;
          const sku = skuIdx !== -1 ? row[skuIdx]?.trim() : '';
          const description = descIdx !== -1 ? row[descIdx]?.trim() : '';
          const quantity = qtyIdx !== -1 ? parseInt(row[qtyIdx]) || 0 : 0;
          const min_quantity = minQtyIdx !== -1 ? parseInt(row[minQtyIdx]) || 5 : 5;
          const price = priceIdx !== -1 ? parseFloat(row[priceIdx]) || 0 : 0;

          const catNamesStr = categoryNameIdx !== -1 ? row[categoryNameIdx]?.trim() : '';
          const category_ids: string[] = [];
          if (catNamesStr) {
            const splitNames = catNamesStr.split(';').map(n => n.trim()).filter(Boolean);
            for (const catName of splitNames) {
              let cat = currentCats.find(c => c.name.toLowerCase() === catName.toLowerCase());
              if (!cat) {
                // Automatically create the category
                cat = await DatabaseService.addCategory(catName);
                currentCats.push(cat);
              }
              category_ids.push(cat.id);
            }
          }

          importedItems.push({
            id,
            name,
            sku,
            description,
            quantity,
            min_quantity,
            price,
            category_ids
          });
        }

        if (importedItems.length === 0) {
          alert("No valid products were found in the CSV file.");
          return;
        }

        if (window.confirm(`Are you sure you want to import ${importedItems.length} products? This will merge new products and update existing ones.`)) {
          await DatabaseService.importItems(importedItems);
          await loadData();
          alert(`Successfully imported/updated ${importedItems.length} products!`);
        }
      } catch (err) {
        console.error("CSV import failed:", err);
        alert("An error occurred while parsing or saving the CSV data. Please ensure it is a valid backup file.");
      }

      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Quick Stock adjustment (+1 / -1)
  const handleQuickAdjust = async (item: Item, amount: number) => {
    if (amount < 0 && item.quantity <= 0) return; // Prevent negative stock

    try {
      const note = amount > 0 ? 'Quick stock addition (+1)' : 'Quick stock deduction (-1)';
      await DatabaseService.adjustStock(item.id, amount, note);
      await loadData();
    } catch (err) {
      console.error("Failed to perform quick adjustment:", err);
    }
  };

  // Delete item
  const handleDeleteItem = async (item: Item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? All transaction logs for this item will also be deleted.`)) {
      try {
        await DatabaseService.deleteItem(item.id);
        await loadData();
      } catch (err) {
        console.error("Failed to delete item:", err);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Package className="w-12 h-12 text-zinc-300 animate-bounce" />
        <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading Store Database...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Filter and search logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesItem = selectedItemFilter === 'all' || item.name === selectedItemFilter;

    const matchesCategory = selectedCategoryFilter === 'all' ||
      (item.category_ids && item.category_ids.includes(selectedCategoryFilter));

    if (filterType === 'low') {
      return matchesSearch && matchesItem && matchesCategory && item.quantity <= item.min_quantity && item.quantity > 0;
    }
    if (filterType === 'out') {
      return matchesSearch && matchesItem && matchesCategory && item.quantity === 0;
    }
    return matchesSearch && matchesItem && matchesCategory;
  });

  // Filter and search logic for Rate List
  const filteredRateItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(rateSearchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(rateSearchQuery.toLowerCase()));
      const matchesItem = selectedItemFilter === 'all' || item.name === selectedItemFilter;
      const matchesCategory = selectedCategoryFilter === 'all' ||
        (item.category_ids && item.category_ids.includes(selectedCategoryFilter));
      return matchesSearch && matchesItem && matchesCategory;
    })
    .sort((a, b) => {
      if (rateSortType === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (rateSortType === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (rateSortType === 'price-asc') {
        return a.price - b.price;
      }
      if (rateSortType === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });

  // Calculate metrics
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.quantity <= i.min_quantity && i.quantity > 0).length;
  const outOfStockCount = items.filter(i => i.quantity === 0).length;
  const totalStockQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-150 min-h-screen pb-20 print:bg-white print:text-black print:pb-0">

      {/* Print-Only Header Sheet */}
      <div className="hidden print:block mb-6 border-b-2 border-zinc-950 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-950">Store Catalog & Rate List</h1>
            <p className="text-xs text-zinc-600 mt-1">Official Price Index & Inventory Catalog</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-850">Date: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Total Products Listed: {items.length}</p>
          </div>
        </div>
      </div>

      {/* Upper Premium Header Banner */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">Store Inventory</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Production Inventory Control & Audit</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input for CSV Import */}
            <input
              type="file"
              id="csv-import-file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />

            <button
              onClick={() => document.getElementById('csv-import-file')?.click()}
              className="flex items-center gap-1.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 sm:px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-zinc-250 dark:border-zinc-800 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer shrink-0"
              title="Import CSV backup file"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Import CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2.5 sm:px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-zinc-250 dark:border-zinc-800 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer shrink-0"
              title="Export database to CSV"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              onClick={() => {
                setSelectedItemForEdit(null);
                setIsItemModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/10 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer shrink-0"
              title="Add Item"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="p-2.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl border border-zinc-250 dark:border-zinc-800 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer flex items-center justify-center shrink-0"
              title="Security Credentials"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl border border-zinc-250 dark:border-zinc-800 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  localStorage.removeItem('store_authenticated');
                  setIsAuthenticated(false);
                }
              }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900/40 transition-all hover:-translate-y-px active:translate-y-0 cursor-pointer flex items-center justify-center shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 print:py-0 print:px-0 print:max-w-full print:space-y-0">

        {/* KPI Dashboard Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
          {/* Card: Total Items */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Total Items</span>
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-450">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{totalItems}</span>
              <span className="text-[10px] text-zinc-400 block mt-1">Unique stock catalogued</span>
            </div>
          </div>

          {/* Card: Stock Volume */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Stock Volume</span>
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-450">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{totalStockQuantity}</span>
              <span className="text-[10px] text-zinc-400 block mt-1">Total pieces in storage</span>
            </div>
          </div>

          {/* Card: Alert Metrics */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Alerts</span>
              <div className={`p-1.5 rounded-xl ${lowStockCount > 0 || outOfStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-450'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div>
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-white'}`}>
                  {lowStockCount}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">Low Stock</span>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-450' : 'text-zinc-900 dark:text-white'}`}>
                  {outOfStockCount}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">Out of Stock</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Toggle Navigation */}
        <section className="flex border-b border-zinc-200 dark:border-zinc-800 print:hidden w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-6 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">Stock</span>
            <span className="hidden sm:inline">Inventory Stock</span>
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-6 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'rates'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
          >
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">Rates</span>
            <span className="hidden sm:inline">Rate List</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-6 py-3 border-b-2 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="sm:hidden">Ledger</span>
            <span className="hidden sm:inline">Transaction Ledger</span>
          </button>
        </section>

        {/* Dynamic Tab Contents */}
        {activeTab === 'inventory' ? (
          <section className="space-y-4">

            {/* Search and Filters bar */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by item name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-zinc-500 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Item Filter Dropdown */}
              <select
                value={selectedItemFilter}
                onChange={(e) => {
                  setSelectedItemFilter(e.target.value);
                  setSelectedCategoryFilter('all');
                }}
                className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm cursor-pointer text-zinc-700 dark:text-zinc-300 font-semibold shrink-0"
              >
                <option value="all">All Items</option>
                {uniqueItemNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              {/* Category Filter Dropdown */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm cursor-pointer text-zinc-700 dark:text-zinc-100 font-semibold shrink-0"
              >
                <option value="all">All Categories</option>
                {availableCategoriesForFilter.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterType === 'all'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setFilterType('low')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${filterType === 'low'
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'text-zinc-500 hover:text-amber-600'
                    }`}
                >
                  Low Stock
                  {lowStockCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                      {lowStockCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilterType('out')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${filterType === 'out'
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-455 shadow-sm'
                    : 'text-zinc-500 hover:text-rose-600'
                    }`}
                >
                  Out of Stock
                  {outOfStockCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                      {outOfStockCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Items Grid/List */}
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 py-16 px-6 text-center shadow-sm">
                <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">No items found</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {searchQuery || filterType !== 'all'
                    ? "Try adjusting your search query or removing filters."
                    : "Your inventory is currently empty. Click the 'Add Item' button to log items into your database."}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button
                    onClick={() => {
                      setSelectedItemForEdit(null);
                      setIsItemModalOpen(true);
                    }}
                    className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => {
                  const isOutOfStock = item.quantity === 0;
                  const isLowStock = item.quantity <= item.min_quantity && !isOutOfStock;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Item Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">{item.name}</h3>
                            <div className="flex gap-1.5 flex-wrap items-center mt-1">
                              {item.sku && (
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded-md text-zinc-500 font-semibold inline-block uppercase tracking-wider">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.category_ids && item.category_ids.map(catId => {
                                const cat = categories.find(c => c.id === catId);
                                if (!cat) return null;
                                return (
                                  <span key={catId} className="text-[10px] bg-blue-55 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400 font-semibold inline-block uppercase tracking-wider">
                                    {cat.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Stock Status Badge */}
                          {isOutOfStock ? (
                            <span className="shrink-0 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="shrink-0 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 border border-amber-250 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              Low Stock
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              In Stock
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-zinc-550 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Unit price and asset value removed to separate stock quantity from rate list */}
                      </div>

                      {/* Stock Adjustments & CRUD Controls */}
                      <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">

                        {/* Quick stock adjustment counter */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            disabled={item.quantity <= 0}
                            className="p-1 text-zinc-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                            title="Deduct 1 unit"
                          >
                            <MinusCircle className="w-6 h-6" />
                          </button>

                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">
                              {item.quantity}
                            </span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 uppercase">
                              pcs
                            </span>
                          </div>

                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                            title="Add 1 unit"
                          >
                            <PlusCircle className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItemForAdjust(item);
                              setAdjustModalType('add');
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250/30 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Add Quantity"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItemForAdjust(item);
                              setAdjustModalType('subtract');
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-205/30 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Deduct Quantity"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Deduct</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItemForEdit(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-850 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : activeTab === 'rates' ? (
          <section className="space-y-4">
            {/* Search and Sort controls - Screen Only */}
            <div className="flex flex-col md:flex-row gap-3 print:hidden">
              {/* Search input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search rates by item name or SKU..."
                  value={rateSearchQuery}
                  onChange={(e) => setRateSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm placeholder-zinc-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                </div>

                {/* Item Filter Dropdown */}
                <select
                  value={selectedItemFilter}
                  onChange={(e) => {
                    setSelectedItemFilter(e.target.value);
                    setSelectedCategoryFilter('all');
                  }}
                  className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm cursor-pointer text-zinc-700 dark:text-zinc-300 font-semibold shrink-0"
                >
                  <option value="all">All Items</option>
                  {uniqueItemNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                {/* Category Filter Select for rates */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm cursor-pointer text-zinc-700 dark:text-zinc-300 font-semibold shrink-0"
                >
                  <option value="all">All Categories</option>
                  {availableCategoriesForFilter.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                {/* Sorting and Actions */}
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0 flex-wrap sm:flex-nowrap">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 select-none">Sort By</span>
                  <select
                    value={rateSortType}
                    onChange={(e) => setRateSortType(e.target.value as typeof rateSortType)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-355 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>

                  <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-205 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print List
                  </button>

                  <button
                    onClick={() => {
                      setSelectedItemForEdit(null);
                      setIsItemModalOpen(true);
                    }}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Rate List Table */}
              {filteredRateItems.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 py-16 px-6 text-center shadow-sm print:border-none print:bg-transparent">
                  <DollarSign className="w-12 h-12 text-zinc-355 dark:text-zinc-700 mx-auto animate-pulse" />
                  <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">No products found</h3>
                  <p className="mt-1 text-sm text-zinc-550 dark:text-zinc-400 max-w-sm mx-auto">
                    {rateSearchQuery
                      ? "Try adjusting your search query."
                      : "No products exist in your inventory yet. Add your first item to build the rate list."}
                  </p>
                  {!rateSearchQuery && (
                    <button
                      onClick={() => {
                        setSelectedItemForEdit(null);
                        setIsItemModalOpen(true);
                      }}
                      className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/85 overflow-hidden shadow-sm print:border-none print:shadow-none print:bg-transparent">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-550 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800 select-none print:bg-zinc-100 print:text-zinc-950 print:border-zinc-300">
                          <th className="px-3 sm:px-6 py-3 sm:py-4 w-16">S.No</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4">Product Name</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4">SKU / Barcode</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4">Unit Price</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 print:hidden text-violet-500 dark:text-violet-400">Qty × Total</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-right print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 print:divide-zinc-200">
                        {filteredRateItems.map((item, idx) => (
                          <RateListRow
                            key={item.id}
                            item={item}
                            index={idx}
                            categories={categories}
                            onSave={loadData}
                            onEditDetails={(item) => {
                              setSelectedItemForEdit(item);
                              setIsItemModalOpen(true);
                            }}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          ) : (
            /* Transaction History tab */
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm print:hidden">
              <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Transaction Logs</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Chronological audit ledger of stock flow</p>
                </div>
                <div className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 font-semibold px-2.5 py-1.5 rounded-xl">
                  {transactions.length} Records
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <History className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  <h4 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">No transactions recorded</h4>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Transactions will populate automatically as you add items or adjust stock levels.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-550 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800 select-none">
                        <th className="px-6 py-4">Item Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Qty Change</th>
                        <th className="px-6 py-4">Notes</th>
                        <th className="px-6 py-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                      {transactions.map(tx => {
                        const isAdd = tx.type === 'ADD';
                        const isSub = tx.type === 'SUBTRACT';

                        return (
                          <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{tx.item_name}</td>
                            <td className="px-6 py-4">
                              {isAdd ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-md">
                                  <TrendingUp className="w-3 h-3" /> ADD
                                </span>
                              ) : isSub ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-md">
                                  <TrendingDown className="w-3 h-3" /> DEDUCT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md">
                                  SET
                                </span>
                              )}
                            </td>
                            <td className={`px-6 py-4 text-right font-black ${isAdd ? 'text-emerald-600' : isSub ? 'text-rose-600' : 'text-zinc-650 dark:text-zinc-350'}`}>
                              {isAdd ? `+${tx.quantity}` : isSub ? `-${tx.quantity}` : tx.quantity}
                            </td>
                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-450 text-xs font-medium max-w-xs truncate" title={tx.notes}>
                              {tx.notes}
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-400 dark:text-zinc-505 text-xs select-none">
                              {new Date(tx.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            )}
          </section>
        )}
      </main>

      {/* Floating Database Sync status for native app vibe */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 gap-1.5 select-none z-30 print:hidden">
        <Database className="w-3 h-3 text-emerald-500 animate-pulse" />
        <span>Local Database Connection Active (SQLite Driver: Auto)</span>
      </footer>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={loadData}
        itemToEdit={selectedItemForEdit}
      />

      <AdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSave={loadData}
        item={selectedItemForAdjust}
        initialType={adjustModalType}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

    </div>
  );
}
