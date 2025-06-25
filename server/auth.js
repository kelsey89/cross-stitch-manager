// server/auth.js
const jwt = require('jsonwebtoken');
const SECRET = 'replace-this-with-a-secure-secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // { id, username }
    next();
  });
}

module.exports = { authenticateToken, SECRET };
