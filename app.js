/* ====== Налаштування закладу (змініть на свої) ====== */
const CONFIG={
  email:'konstantinkiricenko61@gmail.com',          // сюди приходять заявки на бронювання
  instagram:'https://instagram.com/kavdetektiv.odesa',
  telegram:'https://t.me/exqez',
  phone:'+380 68 111 87 04',
  address:'Центр Одеси, поруч із Дерибасівською'
};
/* ====== Сховище. Зараз — браузер (демо). Пізніше цей блок замінюється на хмарну базу. ====== */
const DB={
  get(k,d){try{const v=localStorage.getItem('kd_'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem('kd_'+k,JSON.stringify(v));return true}catch(e){return false}}
};
const RANKS=[{n:'Стажер',p:0,d:0},{n:'Слідчий',p:100,d:3},{n:'Детектив',p:250,d:5},{n:'Інспектор',p:500,d:7},{n:'Комісар',p:1000,d:10}];
function rankOf(pts){let r=RANKS[0];for(const x of RANKS)if(pts>=x.p)r=x;return r}
function nextRank(pts){return RANKS.find(x=>x.p>pts)||null}
async function hash(s){
  if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  return 'plain:'+s;
}
const Auth={
  users(){return DB.get('users',[])},
  current(){const e=DB.get('session',null);return e?this.users().find(u=>u.email===e)||null:null},
  save(u){const us=this.users().map(x=>x.email===u.email?u:x);DB.set('users',us)},
  async register(name,email,pass){
    email=email.trim().toLowerCase();name=name.trim();
    if(name.length<2)throw 'Вкажіть ім’я (щонайменше 2 літери).';
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))throw 'Перевірте адресу електронної пошти.';
    if(pass.length<6)throw 'Пароль має містити щонайменше 6 символів.';
    const us=this.users();if(us.some(u=>u.email===email))throw 'Акаунт із цією поштою вже є. Увійдіть.';
    const u={name,email,pass:await hash(pass),points:20,since:new Date().toISOString().slice(0,10),best:0,games:0};
    us.push(u);DB.set('users',us);DB.set('session',email);return u;
  },
  async login(email,pass){
    email=email.trim().toLowerCase();const u=this.users().find(x=>x.email===email);
    if(!u||u.pass!==await hash(pass))throw 'Неправильна пошта або пароль.';
    DB.set('session',email);return u;
  },
  logout(){DB.set('session',null)},
  addPoints(n){const u=this.current();if(!u)return null;u.points+=n;this.save(u);return u}
};
function todayISO(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmtDate(d){const [y,m,dd]=d.split('-');return dd+'.'+m+'.'+y}
/* ====== Шапка й підвал на кожній сторінці ====== */
(function(){
  const pages=[['index.html','Головна'],['menu.html','Меню'],['spravy.html','Справи'],['bron.html','Бронювання'],['sertyfikat.html','Сертифікати'],['viktoryna.html','Вікторина'],['vidhuky.html','Відгуки'],['faq.html','Питання']];
  const here=(location.pathname.split('/').pop()||'index.html').replace(/^$/,'index.html');
  const cur=x=>(here===x||here===x.replace('.html','')||(x==='index.html'&&here===''))?' aria-current="page"':'';
  const u=Auth.current();
  const h=document.getElementById('top');
  if(h)h.innerHTML='<a class="brand" href="index.html">🔍 Кав’ярня-детектив</a><nav aria-label="Розділи сайту">'+
    pages.map(p=>`<a href="${p[0]}"${cur(p[0])}>${p[1]}</a>`).join('')+
    `<a class="acc" href="kabinet.html"${cur('kabinet.html')}>${u?esc(u.name.split(' ')[0]):'Увійти'}</a></nav>`;
  const f=document.getElementById('foot');
  if(f)f.innerHTML=`© 2026 Кав’ярня-детектив, Одеса. ${esc(CONFIG.address)}. Щодня 8:00–20:00. Студентський проєкт ОНЕУ.`;
  document.querySelectorAll('[data-cfg]').forEach(el=>{const k=el.dataset.cfg;
    if(el.tagName==='A'){el.href=k==='phone'?'tel:'+CONFIG.phone.replace(/\s/g,''):k==='email'?'mailto:'+CONFIG.email:CONFIG[k];if(k==='phone'||k==='email')el.textContent=CONFIG[k]}
    else el.textContent=CONFIG[k]});
})();
