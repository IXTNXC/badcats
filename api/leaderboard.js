const { redis, season } = require('./_lib');
module.exports = async (req, res) => {
  const s = await season();
  const r = await redis.zrange('lb:' + s, 0, 49, { rev: true, withScores: true });
  const rows = [];
  for (let i = 0; i < r.length; i += 2) {
    const u = await redis.get('user:' + r[i]);
    rows.push({ name: (u && (u.username || u.xHandle)) || 'anon', x: u && u.xHandle, points: r[i + 1] });
  }
  res.json({ season: s, endsAt: await redis.get('season_end'), prize: await redis.get('prize'), rows });
};
