import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  min_quantity: number;
  price: number;
  category_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  item_id: string;
  item_name: string;
  type: 'ADD' | 'SUBTRACT' | 'SET';
  quantity: number;
  notes: string;
  created_at: string;
}

interface DBInterface {
  init(): Promise<void>;
  getItems(): Promise<Item[]>;
  addItem(item: Item): Promise<void>;
  updateItem(id: string, updates: Partial<Item>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  getTransactions(): Promise<Transaction[]>;
  addTransaction(tx: Transaction): Promise<void>;
  
  // Category management
  getCategories(): Promise<Category[]>;
  addCategory(category: Category): Promise<void>;
  updateCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}

class NativeSQLiteDriver implements DBInterface {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'store_inventory_db';

  async init() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    this.db = await this.sqliteConnection.createConnection(
      this.dbName,
      false, // encrypted
      'no-encryption',
      1, // version
      false // readonly
    );
    await this.db.open();

    const createItemsTable = `
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT,
        description TEXT,
        quantity INTEGER NOT NULL,
        min_quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        category_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
      );
    `;

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `;

    await this.db.execute(createItemsTable);
    await this.db.execute(createTransactionsTable);
    await this.db.execute(createCategoriesTable);

    // Migration: Add category_id to items if the table already existed without it
    try {
      await this.db.execute("ALTER TABLE items ADD COLUMN category_id TEXT;");
    } catch (e) {
      // Column might already exist, which is expected on subsequent runs
    }
  }

  async getItems(): Promise<Item[]> {
    if (!this.db) throw new Error("DB not initialized");
    const res = await this.db.query("SELECT * FROM items ORDER BY name ASC;");
    const rawItems = res.values || [];
    return rawItems.map((item: any) => ({
      ...item,
      category_ids: item.category_id ? item.category_id.split(',').filter(Boolean) : []
    })) as Item[];
  }

  async addItem(item: Item): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    const sql = `
      INSERT INTO items (id, name, sku, description, quantity, min_quantity, price, category_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const catIdStr = item.category_ids && item.category_ids.length > 0 ? item.category_ids.join(',') : null;
    const values = [
      item.id,
      item.name,
      item.sku,
      item.description,
      item.quantity,
      item.min_quantity,
      item.price,
      catIdStr,
      item.created_at,
      item.updated_at
    ];
    await this.db.run(sql, values);
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    
    // Map category_ids array to category_id text field
    const dbUpdates = { ...updates } as any;
    if (updates.category_ids !== undefined) {
      dbUpdates.category_id = updates.category_ids.length > 0 ? updates.category_ids.join(',') : null;
      delete dbUpdates.category_ids;
    }

    const keys = Object.keys(dbUpdates).filter(k => k !== 'id');
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => dbUpdates[k] === undefined ? null : dbUpdates[k]);
    values.push(id);

    const sql = `UPDATE items SET ${setClause} WHERE id = ?;`;
    await this.db.run(sql, values);
  }

  async deleteItem(id: string): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.run("DELETE FROM items WHERE id = ?;", [id]);
    await this.db.run("DELETE FROM transactions WHERE item_id = ?;", [id]);
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error("DB not initialized");
    const res = await this.db.query("SELECT * FROM transactions ORDER BY created_at DESC;");
    return (res.values || []) as Transaction[];
  }

  async addTransaction(tx: Transaction): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    const sql = `
      INSERT INTO transactions (id, item_id, item_name, type, quantity, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      tx.id,
      tx.item_id,
      tx.item_name,
      tx.type,
      tx.quantity,
      tx.notes,
      tx.created_at
    ];
    await this.db.run(sql, values);
  }

  // Category management implementation
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error("DB not initialized");
    const res = await this.db.query("SELECT * FROM categories ORDER BY name ASC;");
    return (res.values || []) as Category[];
  }

  async addCategory(category: Category): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    const sql = `INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?);`;
    await this.db.run(sql, [category.id, category.name, category.created_at]);
  }

  async updateCategory(id: string, name: string): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.run("UPDATE categories SET name = ? WHERE id = ?;", [name, id]);
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error("DB not initialized");
    
    // Fetch all items and remove this category from lists
    const items = await this.getItems();
    for (const item of items) {
      if (item.category_ids && item.category_ids.includes(id)) {
        const remaining = item.category_ids.filter(cid => cid !== id);
        const catIdStr = remaining.length > 0 ? remaining.join(',') : null;
        await this.db.run("UPDATE items SET category_id = ? WHERE id = ?;", [catIdStr, item.id]);
      }
    }

    await this.db.run("DELETE FROM categories WHERE id = ?;", [id]);
  }
}

class WebLocalStorageDriver implements DBInterface {
  private itemsKey = 'store_inventory_items';
  private txKey = 'store_inventory_transactions';
  private categoriesKey = 'store_inventory_categories';

  async init() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.itemsKey)) {
        localStorage.setItem(this.itemsKey, JSON.stringify([]));
      }
      if (!localStorage.getItem(this.txKey)) {
        localStorage.setItem(this.txKey, JSON.stringify([]));
      }
      if (!localStorage.getItem(this.categoriesKey)) {
        localStorage.setItem(this.categoriesKey, JSON.stringify([]));
      }
    }
  }

  async getItems(): Promise<Item[]> {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.itemsKey) || '[]';
    const items = JSON.parse(raw) as any[];
    return items.map(item => ({
      ...item,
      category_ids: item.category_ids || (item.category_id ? [item.category_id] : [])
    })).sort((a, b) => a.name.localeCompare(b.name)) as Item[];
  }

  async addItem(item: Item): Promise<void> {
    if (typeof window === 'undefined') return;
    const items = await this.getItems();
    items.push(item);
    localStorage.setItem(this.itemsKey, JSON.stringify(items));
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<void> {
    if (typeof window === 'undefined') return;
    const items = await this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { 
        ...items[idx], 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      localStorage.setItem(this.itemsKey, JSON.stringify(items));
    }
  }

  async deleteItem(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const items = await this.getItems();
    const filteredItems = items.filter(i => i.id !== id);
    localStorage.setItem(this.itemsKey, JSON.stringify(filteredItems));

    const txs = await this.getTransactions();
    const filteredTxs = txs.filter(t => t.item_id !== id);
    localStorage.setItem(this.txKey, JSON.stringify(filteredTxs));
  }

  async getTransactions(): Promise<Transaction[]> {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.txKey) || '[]';
    const txs = JSON.parse(raw) as Transaction[];
    return txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addTransaction(tx: Transaction): Promise<void> {
    if (typeof window === 'undefined') return;
    const txs = await this.getTransactions();
    txs.push(tx);
    localStorage.setItem(this.txKey, JSON.stringify(txs));
  }

  // Category management implementation
  async getCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.categoriesKey) || '[]';
    const cats = JSON.parse(raw) as Category[];
    return cats.sort((a, b) => a.name.localeCompare(b.name));
  }

  async addCategory(category: Category): Promise<void> {
    if (typeof window === 'undefined') return;
    const cats = await this.getCategories();
    cats.push(category);
    localStorage.setItem(this.categoriesKey, JSON.stringify(cats));
  }

  async updateCategory(id: string, name: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const cats = await this.getCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx !== -1) {
      cats[idx].name = name;
      localStorage.setItem(this.categoriesKey, JSON.stringify(cats));
    }
  }

  async deleteCategory(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const cats = await this.getCategories();
    const filteredCats = cats.filter(c => c.id !== id);
    localStorage.setItem(this.categoriesKey, JSON.stringify(filteredCats));

    const items = await this.getItems();
    const updatedItems = items.map(item => {
      if (item.category_ids && item.category_ids.includes(id)) {
        return { 
          ...item, 
          category_ids: item.category_ids.filter(cid => cid !== id) 
        };
      }
      return item;
    });
    localStorage.setItem(this.itemsKey, JSON.stringify(updatedItems));
  }
}

const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
const activeDriver: DBInterface = isNative ? new NativeSQLiteDriver() : new WebLocalStorageDriver();

export class DatabaseService {
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized) return;
    await activeDriver.init();
    this.initialized = true;
  }

  static async getItems(): Promise<Item[]> {
    await this.init();
    return activeDriver.getItems();
  }

  static async addItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
    await this.init();
    
    // Check for duplicate name
    const items = await this.getItems();
    const isDuplicate = items.some(i => i.name.trim().toLowerCase() === itemData.name.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error(`An item named "${itemData.name}" already exists in your inventory.`);
    }

    const now = new Date().toISOString();
    const newItem: Item = {
      ...itemData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: now,
      updated_at: now
    };
    await activeDriver.addItem(newItem);
    
    // Add an initial stock transaction
    await this.addTransaction({
      item_id: newItem.id,
      item_name: newItem.name,
      type: 'SET',
      quantity: newItem.quantity,
      notes: 'Initial inventory creation'
    });

    return newItem;
  }

  static async updateItem(id: string, updates: Partial<Item>): Promise<void> {
    await this.init();
    const items = await this.getItems();
    const original = items.find(i => i.id === id);
    if (!original) throw new Error("Item not found");

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name.trim().toLowerCase() !== original.name.trim().toLowerCase()) {
      const isDuplicate = items.some(i => i.id !== id && i.name.trim().toLowerCase() === updates.name!.trim().toLowerCase());
      if (isDuplicate) {
        throw new Error(`An item named "${updates.name}" already exists in your inventory.`);
      }
    }

    await activeDriver.updateItem(id, updates);

    // If quantity was updated, log a transaction
    if (updates.quantity !== undefined && updates.quantity !== original.quantity) {
      const diff = updates.quantity - original.quantity;
      const type = diff > 0 ? 'ADD' : 'SUBTRACT';
      await this.addTransaction({
        item_id: id,
        item_name: updates.name || original.name,
        type,
        quantity: Math.abs(diff),
        notes: 'Item details updated'
      });
    }
  }

  static async adjustStock(id: string, quantityChange: number, notes: string): Promise<void> {
    await this.init();
    const items = await this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error("Item not found");

    const newQty = Math.max(0, item.quantity + quantityChange);
    if (newQty === item.quantity) return;

    await activeDriver.updateItem(id, { quantity: newQty });

    await this.addTransaction({
      item_id: id,
      item_name: item.name,
      type: quantityChange > 0 ? 'ADD' : 'SUBTRACT',
      quantity: Math.abs(quantityChange),
      notes: notes || (quantityChange > 0 ? 'Stock addition' : 'Stock subtraction')
    });
  }

  static async deleteItem(id: string): Promise<void> {
    await this.init();
    await activeDriver.deleteItem(id);
  }

  static async getTransactions(): Promise<Transaction[]> {
    await this.init();
    return activeDriver.getTransactions();
  }

  static async importItems(importedList: Array<{
    id?: string;
    name: string;
    sku: string;
    description: string;
    quantity: number;
    min_quantity: number;
    price: number;
    category_ids?: string[];
  }>): Promise<void> {
    await this.init();
    const currentItems = await this.getItems();
    
    for (const imported of importedList) {
      const existingById = imported.id ? currentItems.find(item => item.id === imported.id) : null;
      const existingByName = currentItems.find(item => item.name.trim().toLowerCase() === imported.name.trim().toLowerCase());
      const existing = existingById || existingByName;
      
      const now = new Date().toISOString();
      if (existing) {
        // Update details of existing item
        const updates: Partial<Item> = {
          name: imported.name,
          sku: imported.sku,
          description: imported.description,
          min_quantity: imported.min_quantity,
          price: imported.price,
          category_ids: imported.category_ids || [],
          updated_at: now
        };

        // If quantity differs, update it and log a transaction
        if (imported.quantity !== existing.quantity) {
          updates.quantity = imported.quantity;
          const diff = imported.quantity - existing.quantity;
          const type = diff > 0 ? 'ADD' : 'SUBTRACT';
          await this.addTransaction({
            item_id: existing.id,
            item_name: imported.name,
            type,
            quantity: Math.abs(diff),
            notes: 'Imported from CSV database restore (Stock adjusted)'
          });
        }
        
        await activeDriver.updateItem(existing.id, updates);
      } else {
        // Create new item
        const newItem: Item = {
          id: imported.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
          name: imported.name,
          sku: imported.sku,
          description: imported.description,
          quantity: imported.quantity,
          min_quantity: imported.min_quantity,
          price: imported.price,
          category_ids: imported.category_ids || [],
          created_at: now,
          updated_at: now
        };
        await activeDriver.addItem(newItem);
        
        // Log transaction for new item
        await this.addTransaction({
          item_id: newItem.id,
          item_name: newItem.name,
          type: 'SET',
          quantity: newItem.quantity,
          notes: 'Imported new item from CSV'
        });
      }
    }
  }

  // Category wrapper methods
  static async getCategories(): Promise<Category[]> {
    await this.init();
    return activeDriver.getCategories();
  }

  static async addCategory(name: string): Promise<Category> {
    await this.init();
    const categories = await this.getCategories();
    
    // Duplicate check
    const isDuplicate = categories.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error(`A category named "${name}" already exists.`);
    }

    const newCategory: Category = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      created_at: new Date().toISOString()
    };
    await activeDriver.addCategory(newCategory);
    return newCategory;
  }

  static async updateCategory(id: string, name: string): Promise<void> {
    await this.init();
    const categories = await this.getCategories();
    
    // Duplicate check
    const isDuplicate = categories.some(c => c.id !== id && c.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error(`A category named "${name}" already exists.`);
    }

    await activeDriver.updateCategory(id, name.trim());
  }

  static async deleteCategory(id: string): Promise<void> {
    await this.init();
    await activeDriver.deleteCategory(id);
  }

  private static async addTransaction(txData: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
    const tx: Transaction = {
      ...txData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    await activeDriver.addTransaction(tx);
  }
}
