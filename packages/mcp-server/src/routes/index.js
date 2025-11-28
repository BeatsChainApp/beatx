const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const routesDir = __dirname;
  let entries = [];
  try {
    entries = fs.readdirSync(routesDir)
      .filter(f => f.endsWith('.js') && f !== 'index.js')
      .map(f => `/api/${path.basename(f, '.js')}`);
  } catch (e) {
    return res.status(500).json({ ok: false, message: 'Failed to enumerate routes' });
  }

  res.json({ ok: true, active: entries });
};
