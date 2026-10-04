// Uso: UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/new-season.js
const { Redis } = require('@upstash/redis');
const r = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
(async () => { const s = (await r.get('season')) || 1; await r.set('season', s + 1); console.log('Temporada', s + 1); })();
