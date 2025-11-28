module.exports = function(app){
  const fs = require('fs');
  const path = require('path');
  const routesDir = path.join(__dirname);
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'fallbacks.js');

  files.forEach(f => {
    const name = path.basename(f, '.js');
    const mount = `/api/${name}`;
    const routePath = path.join(routesDir, f);

    if (fs.existsSync(routePath)) {
      app.use(mount, (req, res) => {
        res.status(503).json({ ok: false, reason: `${name}_missing_deps` });
      });
    }
  });
};