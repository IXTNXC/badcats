# BadCats

Plataforma de interacción social en X: los usuarios ganan puntos por interactuar con tweets, compiten en un ranking por temporada y se llevan un prize pool.

Misma estructura que NEXUS Casino: `api/` `contracts/` `img/` `js/` `scripts/` `style/` `index.html` `package.json` `vercel.json`.

## Despliegue
1. Sube el repo a GitHub e impórtalo en Vercel.
2. En Vercel añade la integración **Upstash Redis** (crea `KV_REST_API_URL` y `KV_REST_API_TOKEN`).
3. Variable de entorno `ADMIN_EMAILS` = correos admin separados por coma (se registran normal y ven la pestaña Admin).
4. Edita `contracts/collection.json` con la colección NFT.

## Flujo
- Registro con correo y contraseña → perfil (usuario, wallet, @X) → estado *pendiente*.
- Admin aprueba o rechaza manualmente (revisa cuenta X y NFTs de la wallet).
- Admin publica tweets oficiales; usuarios verificados reclaman like (+1), retweet (+2) y comentario (+5, con link validado contra su @X).
- Cada usuario puede promocionar 2 tweets al día. Misión diaria: 5 interacciones = +10 puntos.
- Admin inicia nueva temporada (reinicia ranking) con premio y fecha.
