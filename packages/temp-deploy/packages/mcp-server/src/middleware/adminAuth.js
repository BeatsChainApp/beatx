module.exports = function adminAuth(req, res, next){
  const key = process.env.ADMIN_API_KEY || null
  if(!key) return res.status(500).json({ success: false, message: 'Admin API key not configured on server' })
  const header = req.headers['x-admin-key'] || req.headers['authorization'] || ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : header
  if(!provided || provided !== key) return res.status(403).json({ success: false, message: 'forbidden' })
  next()
}
