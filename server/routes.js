// server/routes.js

const express       = require('express');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const { stringify } = require('csv-stringify');
const multer        = require('multer');
const path          = require('path');
const fs            = require('fs');
const { authenticateToken, SECRET } = require('./auth');
const db            = require('./db');

const router = express.Router();
router.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration
// ─────────────────────────────────────────────────────────────────────────────
// In‐memory for CSV/JSON import:
const importUpload = multer({ storage: multer.memoryStorage() });
// On‐disk for PDF uploads:
const pdfUpload    = multer({ dest: path.join(__dirname, 'uploads') });

// Ensure the uploads directory exists:
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

console.log('routes.js loaded');

//
// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PDF VIEW (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/projects/:id/pdf', (req, res) => {
  const projectId = req.params.id;
  db.get(
    `SELECT pdf_filename FROM projects WHERE id = ?`,
    [projectId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row || !row.pdf_filename) {
        return res.status(404).json({ error: 'No PDF found' });
      }
      const filePath = path.join(__dirname, 'uploads', row.pdf_filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File missing on server' });
      }
      // Serve inline so the browser displays it instead of downloading
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${row.pdf_filename}"`
      );
      res.sendFile(filePath);
    }
  );
});

//
// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION ROUTES (register & login)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username & password required' });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
      [username, hash],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const user = { id: this.lastID, username };
        const token = jwt.sign(user, SECRET);
        res.json({ token });
      }
    );
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(400).json({ error: 'Invalid credentials' });
      bcrypt.compare(password, row.password_hash, (err, match) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });
        const user = { id: row.id, username: row.username };
        const token = jwt.sign(user, SECRET);
        res.json({ token });
      });
    }
  );
});

// All routes below this line require a valid JWT
router.use(authenticateToken);

//
// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PROJECT PDF
// ─────────────────────────────────────────────────────────────────────────────
router.post('/projects/:id/pdf', pdfUpload.single('pdf'), (req, res) => {
  const projectId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Sanitize original filename
  const safeName    = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const newFilename = `${projectId}_${Date.now()}_${safeName}`;
  const destPath    = path.join(__dirname, 'uploads', newFilename);

  fs.rename(req.file.path, destPath, err => {
    if (err) {
      console.error('Failed to move file:', err);
      return res.status(500).json({ error: 'Failed to save PDF file' });
    }

    db.run(
      `UPDATE projects SET pdf_filename = ? WHERE id = ? AND user_id = ?`,
      [newFilename, projectId, req.user.id],
      function (err) {
        if (err) {
          console.error('Failed to update project record:', err);
          return res.status(500).json({ error: 'Failed to update project' });
        }
        res.json({ success: true, filename: newFilename });
      }
    );
  });
});

//
// ─────────────────────────────────────────────────────────────────────────────
// THREADS CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get('/threads', (req, res) => {
  db.all(
    `SELECT * FROM threads WHERE user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/threads', (req, res) => {
  const { code, name, hex, owned } = req.body;
  db.run(
    `INSERT INTO threads (user_id, code, name, hex, owned)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, code, name, hex, owned ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, code, name, hex, owned });
    }
  );
});

router.put('/threads/:id', (req, res) => {
  const { code, name, hex, owned } = req.body;
  db.run(
    `UPDATE threads SET code=?, name=?, hex=?, owned=?
     WHERE id=? AND user_id=?`,
    [code, name, hex, owned ? 1 : 0, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(req.params.id), code, name, hex, owned });
    }
  );
});

router.delete('/threads/:id', (req, res) => {
  db.run(
    `DELETE FROM threads WHERE id=? AND user_id=?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

//
// ─────────────────────────────────────────────────────────────────────────────
// EXPORT / IMPORT THREADS
// ─────────────────────────────────────────────────────────────────────────────
router.get('/threads/export', (req, res) => {
  db.all(
    `SELECT code,name,hex,owned FROM threads WHERE user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .header('Content-Disposition', 'attachment; filename=threads.csv')
        .header('Content-Type', 'text/csv');
      stringify(rows, {
        header: true,
        columns: { code: 'Code', name: 'Name', hex: 'Hex', owned: 'Owned' }
      }).pipe(res);
    }
  );
});

router.post('/threads/import', importUpload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Read & split into lines
  const text    = req.file.buffer.toString('utf8');
  const lines   = text.trim().split('\n');
  const headers = lines.shift()
    .split(',')
    .map(h => h.trim().toLowerCase());

  // Map CSV headers → our DB fields
  const columnMap = {
    floss:     'code',
    'dmc name':'name',
    hex:       'hex',
    owned:     'owned'
  };

  // Parse each row into an object { code, name, hex, owned }
  const parsed = lines.map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj  = {};

    headers.forEach((h, i) => {
      const key = columnMap[h];
      if (!key) return; // skip R, G, B, etc.
      let v = cols[i] || '';

      if (key === 'hex') {
        // ensure leading #
        if (v && !v.startsWith('#')) v = `#${v}`;
      }
      if (key === 'owned') {
        v = v === '1' || v.toLowerCase() === 'true';
      }

      obj[key] = v;
    });

    return obj;
  });

  // Insert into SQLite
  const stmt = db.prepare(
    `INSERT INTO threads (user_id, code, name, hex, owned)
     VALUES (?, ?, ?, ?, ?)`
  );
  parsed.forEach(item => {
    if (!item.code) return;
    stmt.run(
      req.user.id,
      item.code,
      item.name || '',
      item.hex  || '#000000',
      item.owned ? 1 : 0
    );
  });
  stmt.finalize(() => {
    res.json({ imported: parsed.length });
  });
});

//
// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS CRUD
// ─────────────────────────────────────────────────────────────────────────────
router.get('/projects', (req, res) => {
  db.all(
    `SELECT * FROM projects WHERE user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/projects', (req, res) => {
  const { name, description } = req.body;
  db.run(
    `INSERT INTO projects (user_id, name, description)
     VALUES (?, ?, ?)`,
    [req.user.id, name, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, description });
    }
  );
});

router.get('/projects/:id', (req, res) => {
  const pid = Number(req.params.id);
  db.get(
    `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
    [pid, req.user.id],
    (err, project) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!project) return res.status(404).json({ error: 'Not found' });
      db.all(
        `SELECT t.* FROM threads t
         JOIN project_threads pt ON t.id = pt.thread_id
         WHERE pt.project_id = ?`,
        [pid],
        (err, threads) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ ...project, threads });
        }
      );
    }
  );
});

router.put('/projects/:id', (req, res) => {
  const { name, description } = req.body;
  db.run(
    `UPDATE projects SET name = ?, description = ?
     WHERE id = ? AND user_id = ?`,
    [name, description, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(req.params.id), name, description });
    }
  );
});

router.delete('/projects/:id', (req, res) => {
  db.run(
    `DELETE FROM projects WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

//
// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN / UNASSIGN THREADS TO PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
router.post('/projects/:projectId/threads/:threadId', (req, res) => {
  const { projectId, threadId } = req.params;
  db.run(
    `INSERT OR IGNORE INTO project_threads (project_id, thread_id)
     VALUES (?, ?)`,
    [projectId, threadId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ projectId: Number(projectId), threadId: Number(threadId) });
    }
  );
});

router.delete('/projects/:projectId/threads/:threadId', (req, res) => {
  const { projectId, threadId } = req.params;
  db.run(
    `DELETE FROM project_threads WHERE project_id = ? AND thread_id = ?`,
    [projectId, threadId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    }
  );
});

module.exports = router;
