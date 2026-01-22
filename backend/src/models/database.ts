import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, '../../../database/demand_planning.db');

// Initialize database connection
export const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  try {
    const schemaPath = join(__dirname, '../../../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema
    db.exec(schema);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Helper function to get date range (default: today to +26 weeks)
export function getDefaultDateRange() {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (26 * 7));

  return {
    startDate,
    endDate: endDate.toISOString().split('T')[0]
  };
}

// Close database connection gracefully
export function closeDatabase() {
  db.close();
  console.log('Database connection closed');
}

// Handle process termination
process.on('exit', closeDatabase);
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
