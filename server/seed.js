// server/seed.js
const db      = require('./db');
const bcrypt  = require('bcrypt');
const threads = require('./dmc_threads.json');

// 1) Insert a dummy user for seeding
db.serialize(() => {
  db.run(
    `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
    // password_hash can be an empty string or a real hash; here we just use empty
    ['seeduser', ''], 
    function(err) {
      if (err) {
        console.error('Error inserting seed user:', err.message);
        return;
      }
      const userId = this.lastID;
      console.log(`✅ Created seed user with id ${userId}`);

      // 2) Prepare a statement to insert threads with that user_id
      const stmt = db.prepare(
        `INSERT INTO threads (user_id, code, name, hex, owned) VALUES (?, ?, ?, ?, ?)`
      );

      threads.forEach(thread => {
        stmt.run(
          userId,
          thread.code,
          thread.name,
          thread.hex,
          thread.owned ? 1 : 0,
          err => {
            if (err) console.error('Seed insert error:', err.message);
          }
        );
      });

      stmt.finalize(() => {
        console.log('✅ Seeding threads complete');
      });
    }
  );
});
