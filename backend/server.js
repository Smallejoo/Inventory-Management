const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { loadConfig } = require('./config');
async function start() {
  const config = loadConfig();
  const app = express();
  app.use(cors({ origin: config.frontendOrigin }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/reg/auth', require('./routes/auth'));
  app.use('/getitems', require('./routes/fetchItems'));
  app.get('/', (req, res) => res.json({ status: 'ok' }));
  await mongoose.connect(config.mongoUri);
  return app.listen(config.port, () => console.log(`API listening on port ${config.port}`));
}
if (require.main === module) start().catch(() => { console.error('Startup failed. Check MongoDB connectivity and environment configuration.'); process.exitCode = 1; });
module.exports = { start };
