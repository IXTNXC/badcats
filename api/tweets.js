const { redis, auth, day, addPoints } = require('./_lib');
const PTS = { like: 1, retweet: 2, comment: 5 };
const GOAL = 5, BONUS = 10, MAX_POSTS = 2;
const RX = /^https:\/\/(x|twitter)\.com\/([^/]+)\/status\/\d+/i;
module.exports = async (req, res) => {
  const u = await auth(req);
  if (!u) return res.status(401).json({ error: 'auth' });
  const b = req.body || {};
  if (req.method === 'POST' && b.action === 'add') {
    const m = RX.exec(b.url || '');
    if (!m) return res.status(400).json({ error: 'link' });
    const kind = u.isAdmin && b.kind === 'admin' ? 'admin' : 'user';
    if (kind === 'user') {
      if (u.status !== 'verified') return res.status(403).json({ error: 'verify' });
      const n = await redis.incr(`posts:${day()}:${u.email}`);
      if (n > MAX_POSTS) return res.status(429).json({ error: 'limit' });
    }
    const id = Date.now().toString(36);
    await redis.set('tweet:' + id, { id, url: b.url, author: m[2], owner: u.email, kind, ts: Date.now() });
    await redis.lpush(kind === 'admin' ? 'tweets:admin' : 'tweets:user', id);
    return res.json({ ok: true });
  }
  if (req.method === 'POST' && b.action === 'claim') {
    if (u.status !== 'verified') return res.status(403).json({ error: 'verify' });
    const t = await redis.get('tweet:' + b.id);
    if (!t || !PTS[b.type] || t.owner === u.email) return res.status(400).json({ error: 'invalid' });
    if (b.type === 'comment') {
      const m = RX.exec(b.link || '');
      if (!m || m[2].toLowerCase() !== (u.xHandle || '').toLowerCase()) return res.status(400).json({ error: 'link' });
    }
    const first = await redis.set(`claim:${u.email}:${t.id}:${b.type}`, b.link || 1, { nx: true });
    if (!first) return res.status(409).json({ error: 'done' });
    let pts = PTS[b.type];
    const n = await redis.incr(`daily:${day()}:${u.email}`);
    if (n === GOAL) pts += BONUS;
    await addPoints(u.email, pts);
    return res.json({ ok: true, pts });
  }
  const ids = [...await redis.lrange('tweets:admin', 0, 29), ...await redis.lrange('tweets:user', 0, 29)];
  const tweets = (await Promise.all(ids.map(i => redis.get('tweet:' + i)))).filter(Boolean).sort((a, b) => b.ts - a.ts);
  const claimed = [];
  for (const t of tweets) for (const k of Object.keys(PTS))
    if (await redis.exists(`claim:${u.email}:${t.id}:${k}`)) claimed.push(`${t.id}:${k}`);
  const daily = (await redis.get(`daily:${day()}:${u.email}`)) || 0;
  const posts = (await redis.get(`posts:${day()}:${u.email}`)) || 0;
  res.json({ tweets, claimed, daily, goal: GOAL, bonus: BONUS, posts, maxPosts: MAX_POSTS, points: PTS });
};
