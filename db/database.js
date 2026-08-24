import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('expenses.db');

export const CATEGORIES = ['Transpo', 'Food', 'Others'];

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function addExpense(amount, category, createdAt = new Date().toISOString()) {
  db.runSync(
    'INSERT INTO expenses (amount, category, created_at) VALUES (?, ?, ?)',
    [amount, category, createdAt]
  );
}

// Convenience used to feed the Lock Screen widget: today's total + per-category
// breakdown, in the shape the native bridge expects.
export function getTodaySummary() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const rows = getCategoryTotals(start.toISOString(), end.toISOString());
  const byCategory = {};
  let total = 0;
  for (const r of rows) {
    byCategory[r.category] = r.total;
    total += r.total;
  }
  return { total, byCategory };
}

export function deleteExpense(id) {
  db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
}

// Returns rows between two ISO timestamps (inclusive start, exclusive end)
export function getExpensesBetween(startISO, endISO) {
  return db.getAllSync(
    'SELECT * FROM expenses WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC',
    [startISO, endISO]
  );
}

export function getCategoryTotals(startISO, endISO) {
  return db.getAllSync(
    `SELECT category, SUM(amount) as total, COUNT(*) as count
     FROM expenses
     WHERE created_at >= ? AND created_at < ?
     GROUP BY category
     ORDER BY total DESC`,
    [startISO, endISO]
  );
}

export function getGrandTotal(startISO, endISO) {
  const row = db.getFirstSync(
    'SELECT SUM(amount) as total FROM expenses WHERE created_at >= ? AND created_at < ?',
    [startISO, endISO]
  );
  return row?.total || 0;
}
