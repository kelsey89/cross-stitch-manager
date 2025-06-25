// server/db.js

const fs     = require('fs');
const path   = require('path');
const sqlite = require('sqlite3').verbose();

const isTest = process.env.NODE_ENV === 'test';
const dbPath = isTest
  ? ':memory:'
  : path.join(__dirname, 'threads.db');

// Ensure uploads directory exists (only in non-test)
if (!isTest) {
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
}

const db = new sqlite.Database(dbPath, err => {
  if (err) console.error('DB open error:', err);
  else console.log(`Using database: ${dbPath}`);
});

db.serialize(() => {
  // ─── Only drop tables in test mode ───
  if (isTest) {
    db.run(`DROP TABLE IF EXISTS project_threads;`);
    db.run(`DROP TABLE IF EXISTS projects;`);
    db.run(`DROP TABLE IF EXISTS threads;`);
    db.run(`DROP TABLE IF EXISTS users;`);
  }

  // ─── Users ───
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      username       TEXT    UNIQUE,
      password_hash  TEXT
    );
  `);

  // ─── Threads ───
  db.run(`
    CREATE TABLE IF NOT EXISTS threads (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      code       TEXT    NOT NULL,
      name       TEXT,
      hex        TEXT,
      owned      INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ─── Projects (w/ pdf_filename) ───
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      name          TEXT    NOT NULL,
      description   TEXT,
      pdf_filename  TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ─── Join table ───
  db.run(`
    CREATE TABLE IF NOT EXISTS project_threads (
      project_id INTEGER NOT NULL,
      thread_id  INTEGER NOT NULL,
      PRIMARY KEY (project_id, thread_id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(thread_id)  REFERENCES threads(id)  ON DELETE CASCADE
    );
  `);

  console.log('All tables are ready.');
});

module.exports = db;
