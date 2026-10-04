const I18N={
es:{welcome:'Bienvenido a BadCats',welcome_sub:'Interactúa, suma puntos y compite por el premio.',email:'Correo electrónico',password:'Contraseña (mín. 8)',login:'Entrar',register:'Crear cuenta',
feed:'Tweets',missions:'Misiones',leaderboard:'Ranking',profile:'Perfil',admin:'Admin',settings:'Ajustes',logout:'Cerrar sesión',
username:'Nombre de usuario',wallet:'Wallet (con NFTs de la colección)',xhandle:'Tu @ de X',save:'Guardar y enviar a verificación',
verified:'Verificado',pending:'Pendiente de revisión',rejected:'Rechazado',incomplete:'Completa tu perfil',
need_verify:'Tu cuenta debe estar verificada para ganar puntos.',official:'Tweets oficiales',community:'Tweets de la comunidad',open:'Abrir en X',
like:'Like',retweet:'Retweet',comment:'Comentario',paste:'Pega el link de tu comentario en X',promote:'Promociona tu tweet',promo_left:'Tweets hoy',post:'Publicar',
daily:'Misión diaria',daily_desc:'Completa {n} interacciones hoy y gana +{b} puntos extra',points:'puntos',season:'Temporada',prize:'Premio',empty:'Aún no hay nada aquí.',
language:'Idioma',users:'Usuarios',approve:'Aprobar',reject:'Rechazar',add_official:'Añadir tweet oficial',new_season:'Nueva temporada',prize_ph:'Premio (ej. 5000 TOKEN)',ends:'Termina',
done:'Ya reclamado',ok:'Listo',err:'Error o dato inválido',saved:'Guardado',delete:'Borrar',rules:'Los likes y retweets se auditan manualmente. El comentario requiere link.'},
en:{welcome:'Welcome to BadCats',welcome_sub:'Engage, earn points and compete for the prize.',email:'Email',password:'Password (min. 8)',login:'Log in',register:'Sign up',
feed:'Tweets',missions:'Missions',leaderboard:'Leaderboard',profile:'Profile',admin:'Admin',settings:'Settings',logout:'Log out',
username:'Username',wallet:'Wallet (holding collection NFTs)',xhandle:'Your X @',save:'Save and submit for review',
verified:'Verified',pending:'Pending review',rejected:'Rejected',incomplete:'Complete your profile',
need_verify:'Your account must be verified to earn points.',official:'Official tweets',community:'Community tweets',open:'Open on X',
like:'Like',retweet:'Retweet',comment:'Comment',paste:'Paste the link to your comment on X',promote:'Promote your tweet',promo_left:'Tweets today',post:'Post',
daily:'Daily mission',daily_desc:'Complete {n} interactions today for +{b} bonus points',points:'points',season:'Season',prize:'Prize',empty:'Nothing here yet.',
language:'Language',users:'Users',approve:'Approve',reject:'Reject',add_official:'Add official tweet',new_season:'New season',prize_ph:'Prize (e.g. 5000 TOKEN)',ends:'Ends',
done:'Already claimed',ok:'Done',err:'Error or invalid data',saved:'Saved',delete:'Delete',rules:'Likes and retweets are audited manually. Comments require a link.'}};
let LANG=localStorage.getItem('lang')||(navigator.language.startsWith('en')?'en':'es');
const t=(k,v={})=>(I18N[LANG][k]||k).replace(/\{(\w+)\}/g,(_,x)=>v[x]);
