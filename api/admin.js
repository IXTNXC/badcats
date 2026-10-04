const { redis, auth } = require('./_lib');
module.exports = async (req, res) => {
  const u = await auth(req);
  if (!u || !u.isAdmin) return res.status(403).json({ error: 'admin' });
  const b = req.body || {};
  if (b.action === 'status') {
    const t = await redis.get('user:' + b.email);
    if (t && ['verified', 'rejected'].includes(b.status)) await redis.set('user:' + b.email, { ...t, status: b.status });
  }
  if (b.action === 'season') {
    await redis.set('season', ((await redis.get('season')) || 1) + 1);
    await redis.set('season_end', b.endsAt || null);
    await redis.set('prize', b.prize || '');
  }
  if (b.action === 'delete') await redis.del('tweet:' + b.id);
  const emails = await redis.smembers('users');
  const users = (await Promise.all(emails.map(e => redis.get('user:' + e)))).filter(x => x && x.status !== 'incomplete')
    .map(x => ({ email: x.email, username: x.username, wallet: x.wallet, xHandle: x.xHandle, status: x.status }));
  res.json({ users });
};
