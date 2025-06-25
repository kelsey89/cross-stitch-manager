// server/index.js
const express = require('express');
const cors    = require('cors');
const routes  = require('./routes');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Mount your API
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

// Only start the HTTP server if we're NOT running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for testing (Supertest will use this)
module.exports = app;
