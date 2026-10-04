const $=s=>document.querySelector(s);
let TOKEN=localStorage.getItem('token'),ME=null,TAB='feed';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const e=$('#toast');e.textContent=m;e.className='show';setTimeout(()=>e.className='',2200)};
async function api(path,body){
  const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(TOKEN||'')},body:body&&JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw d;return d;
}
function i18nApply(){
  document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
  document.querySelectorAll('[data-p]').forEach(e=>e.placeholder=t(e.dataset.p));
  document.querySelectorAll('[data-lang]').forEach(s=>{s.innerHTML='<option value="es">Español</option><option value="en">English</option>';s.value=LANG;s.onchange=()=>{LANG=s.value;localStorage.setItem('lang',LANG);i18nApply();ME&&render()}});
  document.documentElement.lang=LANG;
}
async function authGo(action){
  try{const d=await api('auth',{action,email:$('#email').value,password:$('#pass').value});TOKEN=d.token;localStorage.setItem('token',TOKEN);boot()}
  catch{$('#authMsg').textContent=t('err')}
}
$('#login').onclick=()=>authGo('login');$('#register').onclick=()=>authGo('register');
async function boot(){
  if(!TOKEN)return;
  try{ME=(await api('auth',{action:'me'})).user}catch{TOKEN=null;localStorage.removeItem('token');return}
  $('#auth').hidden=true;$('#app').hidden=false;if(ME.status==='incomplete')TAB='profile';render();
}
function render(){
  const tabs=['feed','missions','leaderboard','profile',...(ME.isAdmin?['admin']:[]),'settings'];
  const n=$('#nav');n.hidden=false;
  n.innerHTML=tabs.map(k=>`<button class="${k===TAB?'on':''}" data-t="${k}">${t(k)}</button>`).join('');
  n.querySelectorAll('button').forEach(b=>b.onclick=()=>{TAB=b.dataset.t;render()});
  $('#app').innerHTML='';views[TAB]();
}
const view=h=>$('#app').innerHTML=h;
const views={
async feed(){
  const d=await api('tweets');const ok=ME.status==='verified';
  const card=x=>`<div class="card tweet ${x.kind}"><div class="row" style="justify-content:space-between"><b>@${esc(x.author)}</b><a href="${esc(x.url)}" target="_blank" rel="noopener">${t('open')}</a></div>
  <div class="row" style="margin-top:10px">${['like','retweet','comment'].map(k=>`<button class="sm ghost" data-c="${x.id}:${k}" ${!ok||x.owner===ME.email||d.claimed.includes(x.id+':'+k)?'disabled':''}>${t(k)} +${d.points[k]}</button>`).join('')}
  ${ME.isAdmin&&x.kind==='user'?`<button class="sm ghost" data-del="${x.id}">${t('delete')}</button>`:''}</div></div>`;
  const a=d.tweets.filter(x=>x.kind==='admin'),c=d.tweets.filter(x=>x.kind==='user');
  view(`${ok?'':`<div class="card">${t('need_verify')}</div>`}
  <div class="card"><h3>${t('promote')}</h3><div class="muted">${t('promo_left')}: ${d.posts}/${d.maxPosts}</div><div class="row"><input id="pl" placeholder="https://x.com/user/status/123" style="flex:1"><button id="pb">${t('post')}</button></div></div>
  <h2>${t('official')}</h2>${a.map(card).join('')||`<p class="muted">${t('empty')}</p>`}<h2>${t('community')}</h2>${c.map(card).join('')||`<p class="muted">${t('empty')}</p>`}<p class="muted">${t('rules')}</p>`);
  $('#pb').onclick=()=>act('tweets',{action:'add',url:$('#pl').value});
  document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const[id,type]=b.dataset.c.split(':');let link;if(type==='comment'){link=prompt(t('paste'));if(!link)return}act('tweets',{action:'claim',id,type,link})});
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>act('admin',{action:'delete',id:b.dataset.del}));
},
async missions(){
  const d=await api('tweets');const p=Math.min(100,d.daily/d.goal*100);
  view(`<div class="card"><h2>${t('daily')}</h2><p class="muted">${t('daily_desc',{n:d.goal,b:d.bonus})}</p><div class="bar"><i style="width:${p}%"></i></div><p>${d.daily}/${d.goal}</p></div>
  <div class="card"><div class="muted">${t('points')}</div><div class="big">${ME.points}</div></div>`);
},
async leaderboard(){
  const d=await api('leaderboard');
  view(`<div class="card"><h2>${t('season')} ${d.season}</h2>${d.prize?`<p>🏆 ${t('prize')}: <b>${esc(d.prize)}</b></p>`:''}${d.endsAt?`<p class="muted">${t('ends')}: ${esc(d.endsAt)}</p>`:''}
  <table>${d.rows.map((r,i)=>`<tr class="${i<3?'rank1':''}"><td>${i+1}</td><td>${esc(r.name)} <span class="muted">@${esc(r.x||'')}</span></td><td>${r.points} ${t('points')}</td></tr>`).join('')||`<tr><td class="muted">${t('empty')}</td></tr>`}</table></div>`);
},
profile(){
  view(`<div class="card"><h2>${t('profile')} <span class="badge ${ME.status}">${t(ME.status)}</span></h2><div class="muted">${esc(ME.email)}</div>
  <input id="pu" placeholder="${t('username')}" value="${esc(ME.username)}"><input id="pw" placeholder="${t('wallet')}" value="${esc(ME.wallet)}"><input id="px" placeholder="${t('xhandle')}" value="${esc(ME.xHandle)}">
  <button id="ps">${t('save')}</button></div>`);
  $('#ps').onclick=async()=>{try{ME=(await api('auth',{action:'profile',username:$('#pu').value,wallet:$('#pw').value,xHandle:$('#px').value})).user;toast(t('saved'));render()}catch{toast(t('err'))}};
},
settings(){
  view(`<div class="card"><h2>${t('settings')}</h2><label>${t('language')}</label><select data-lang></select><p><button class="ghost" id="lo">${t('logout')}</button></p></div>`);
  i18nApply();$('#lo').onclick=()=>{localStorage.removeItem('token');location.reload()};
},
async admin(){
  const d=await api('admin',{});
  view(`<div class="card"><h3>${t('add_official')}</h3><div class="row"><input id="al" placeholder="https://x.com/user/status/123" style="flex:1"><button id="ab">${t('post')}</button></div></div>
  <div class="card"><h3>${t('new_season')}</h3><input id="sp" placeholder="${t('prize_ph')}"><input id="se" type="date"><button id="sb">${t('new_season')}</button></div>
  <div class="card"><h3>${t('users')}</h3><table>${d.users.map(u=>`<tr><td>${esc(u.username)}<br><span class="muted">@${esc(u.xHandle)}</span></td><td style="word-break:break-all;font-size:12px">${esc(u.wallet)}</td><td><span class="badge ${u.status}">${t(u.status)}</span></td>
  <td><button class="sm" data-s="verified:${esc(u.email)}">${t('approve')}</button> <button class="sm ghost" data-s="rejected:${esc(u.email)}">${t('reject')}</button></td></tr>`).join('')}</table></div>`);
  $('#ab').onclick=()=>act('tweets',{action:'add',kind:'admin',url:$('#al').value});
  $('#sb').onclick=()=>act('admin',{action:'season',prize:$('#sp').value,endsAt:$('#se').value});
  document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const[status,email]=b.dataset.s.split(':');act('admin',{action:'status',status,email})});
}};
async function act(path,body){
  try{const d=await api(path,body);toast(d.pts?`+${d.pts} ${t('points')}`:t('ok'));ME=(await api('auth',{action:'me'})).user;render()}
  catch(e){toast(e.error==='done'?t('done'):t('err'))}
}
i18nApply();boot();
