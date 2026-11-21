function loadConfig(env = process.env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET.startsWith('replace-with')) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters.');
  }
  return { jwtSecret: env.JWT_SECRET, mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_demo', port: Number(env.PORT || 3000), frontendOrigin: env.FRONTEND_ORIGIN || 'http://localhost:5173' };
}
module.exports = { loadConfig };
