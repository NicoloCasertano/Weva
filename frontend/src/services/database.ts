import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { Quote, QuoteItem } from '@weva/shared';

let db: SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync('weva.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      clientName TEXT NOT NULL,
      clientEmail TEXT,
      clientPhone TEXT,
      notes TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      validUntil TEXT NOT NULL,
      status TEXT DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quoteId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      quantity REAL DEFAULT 1,
      unitPrice REAL DEFAULT 0,
      sortOrder INTEGER DEFAULT 0,
      FOREIGN KEY (quoteId) REFERENCES quotes(id) ON DELETE CASCADE
    );
  `);
  return db;
}

type QuoteRow = {
  id: string; clientName: string; clientEmail: string | null; clientPhone: string | null;
  notes: string; createdAt: string; validUntil: string; status: string;
};

async function rowToQuote(d: SQLiteDatabase, row: QuoteRow): Promise<Quote> {
  const items = await d.getAllAsync<QuoteItem & { quoteId: string; sortOrder: number }>(
    'SELECT * FROM quote_items WHERE quoteId = ? ORDER BY sortOrder', row.id
  );
  return {
    ...row,
    clientEmail: row.clientEmail ?? undefined,
    clientPhone: row.clientPhone ?? undefined,
    status: row.status as Quote['status'],
    items: items.map(({ quoteId: _q, sortOrder: _s, ...rest }) => rest),
  };
}

export async function saveQuote(quote: Quote): Promise<void> {
  const d = await getDb();
  await d.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `INSERT OR REPLACE INTO quotes (id, clientName, clientEmail, clientPhone, notes, createdAt, validUntil, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      quote.id, quote.clientName, quote.clientEmail ?? null, quote.clientPhone ?? null,
      quote.notes, quote.createdAt, quote.validUntil, quote.status
    );
    await tx.runAsync('DELETE FROM quote_items WHERE quoteId = ?', quote.id);
    for (let i = 0; i < quote.items.length; i++) {
      const item = quote.items[i];
      await tx.runAsync(
        `INSERT INTO quote_items (id, quoteId, name, description, quantity, unitPrice, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.id, quote.id, item.name, item.description, item.quantity, item.unitPrice, i
      );
    }
  });
}

export async function getAllQuotes(): Promise<Quote[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<QuoteRow>('SELECT * FROM quotes ORDER BY createdAt DESC');
  return Promise.all(rows.map((row) => rowToQuote(d, row)));
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const d = await getDb();
  const row = await d.getFirstAsync<QuoteRow>('SELECT * FROM quotes WHERE id = ?', id);
  return row ? rowToQuote(d, row) : null;
}

export async function deleteQuote(id: string): Promise<void> {
  const d = await getDb();
  await d.runAsync('DELETE FROM quote_items WHERE quoteId = ?', id);
  await d.runAsync('DELETE FROM quotes WHERE id = ?', id);
}

export async function updateQuoteStatus(id: string, status: Quote['status']): Promise<void> {
  const d = await getDb();
  await d.runAsync('UPDATE quotes SET status = ? WHERE id = ?', status, id);
}
