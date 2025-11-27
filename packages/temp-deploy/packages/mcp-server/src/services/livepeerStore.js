const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, '..', '..', 'data');
const STORE_FILE = path.join(STORE_DIR, 'livepeerStore.json');

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify({ assets: {} }, null, 2));
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(STORE_FILE, 'utf8');
  return JSON.parse(raw || '{"assets":{}}');
}

function writeStore(obj) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2));
}

async function saveAsset(asset) {
  const store = readStore();
  store.assets = store.assets || {};
  store.assets[asset.id || asset.assetId || asset._id || `a-${Date.now()}`] = asset;
  writeStore(store);
  return asset;
}

async function getAsset(id) {
  const store = readStore();
  return store.assets && store.assets[id];
}

async function listAssets() {
  const store = readStore();
  return Object.values(store.assets || {});
}

async function updateAsset(id, patch) {
  const store = readStore();
  store.assets = store.assets || {};
  store.assets[id] = { ...(store.assets[id] || {}), ...patch };
  writeStore(store);
  return store.assets[id];
}

module.exports = {
  saveAsset,
  getAsset,
  listAssets,
  updateAsset
};

