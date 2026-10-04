const { redis, auth, hash, pub, crypto } = require('./_lib');
module.exports = async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').toLowerCase().trim();
  if (b.action === 'register') {
    if (!/^\S+@\S+\.\S+$/.test(email) || (b.password || '').length < 8) return res.status(400).json({ error: 'invalid' });
    if (await redis.get('user:' + email)) return res.status(409).json({ error: 'exists' });
    const salt = crypto.randomBytes(16).toString('hex');
    await redis.set('user:' + email, { email, salt, pass: hash(b.password, salt), status: 'incomplete', created: Date.now() });
    await redis.sadd('users', email);
  }
  if (b.action === 'register' || b.action === 'login') {
    const u = await redis.get('user:' + email);
    if (!u || hash(b.password || '', u.salt) !== u.pass) return res.status(401).json({ error: 'credentials' });
    const t = crypto.randomBytes(24).toString('hex');
    await redis.set('sess:' + t, email, { ex: 60 * 60 * 24 * 30 });
    return res.json({ token: t });
  }
  const u = await auth(req);
  if (!u) return res.status(401).json({ error: 'auth' });
  if (b.action === 'profile') {
    const x = String(b.xHandle || '').replace('@', '').trim();
    const full = await redis.get('user:' + u.email);
    Object.assign(full, { username: String(b.username || '').slice(0, 30), wallet: String(b.wallet || '').trim().slice(0, 100), xHandle: x, status: 'pending' });
    await redis.set('user:' + u.email, full);
    return res.json({ user: pub({ ...u, ...full }) });
  }
  res.json({ user: pub(u) });
};
