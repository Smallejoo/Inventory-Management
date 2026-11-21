const jwt = require('jsonwebtoken');
const { loadConfig } = require('../config');
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Sign in required' });
  try {
    const claims = jwt.verify(header.slice(7), loadConfig().jwtSecret, { algorithms: ['HS256'] });
    if (typeof claims.id !== 'string' || !/^[a-f0-9]{24}$/i.test(claims.id)) throw new Error('Invalid subject');
    req.userId = claims.id;
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
module.exports = authenticate;
