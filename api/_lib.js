const { Redis } = require('@upstash/redis');
const crypto = require('crypto');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
});
const admins = () => (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim());
const day = () => new Date().toISOString().slice(0, 10);
const season = async () => (await redis.get('season')) || 1;
const hash = (p, s) => crypto.scryptSync(p, s, 32).toString('hex');
async function auth(req) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (!t) return null;
  const email = await redis.get('sess:' + t);
  const u = email && await redis.get('user:' + email);
  if (!u) return null;
  const pts = await redis.zscore('lb:' + await season(), email);
  return { ...u, points: pts || 0, isAdmin: admins().includes(email) };
}
const pub = u => ({ email: u.email, username: u.username, wallet: u.wallet, xHandle: u.xHandle, status: u.status, points: u.points, isAdmin: u.isAdmin });
async function addPoints(email, n) { await redis.zincrby('lb:' + await season(), n, email); }
module.exports = { redis, auth, hash, pub, day, season, addPoints, crypto };
