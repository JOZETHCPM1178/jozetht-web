/* ============================================================
   ModZone — app.js
   Firebase Firestore integrado para contenido permanente.

   ╔══════════════════════════════════════════════════════╗
   ║  CONFIGURACIÓN FIREBASE — SOLO EDITA ESTA SECCIÓN   ║
   ║  Sigue la guía SETUP.md para obtener estos valores  ║
   ╚══════════════════════════════════════════════════════╝
   ============================================================ */

'use strict';

/* ─── 🔥 TUS CREDENCIALES DE FIREBASE ───────────────────────────────────────
   Reemplaza estos valores con los de tu proyecto Firebase.
   Los obtienes en: Firebase Console → Tu proyecto → ⚙️ Configuración → SDK
   ─────────────────────────────────────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyC4ubClTMdyw1kqtE38BtqIkeKuRgDuzyU",
  authDomain:        "modzone-asmodeo.firebaseapp.com",
  projectId:         "modzone-asmodeo",
  storageBucket:     "modzone-asmodeo.firebasestorage.app",
  messagingSenderId: "754848736365",
  appId:             "1:754848736365:web:78001b8718618a3852cb64"
};

/* ─── 🔒 PIN DE ADMINISTRADOR ────────────────────────────────────────────────
   Cambia este PIN para proteger el panel de admin.
   Solo quien sepa el PIN podrá agregar o eliminar contenido.
   ─────────────────────────────────────────────────────────────────────────── */
const ADMIN_PIN = "0011";

/* ─── CONTENIDO INICIAL (se sube a Firestore solo la primera vez) ────────────
   Si tu Firestore ya tiene datos, este bloque se ignora automáticamente.
   ─────────────────────────────────────────────────────────────────────────── */
const SEED_CONTENT = [
  { category:'apk',     name:'WhatsApp Mod Gold',       version:'v9.65',      emoji:'💬', desc:'WhatsApp con temas exclusivos, mensajes programados, modo anti-ban y privacidad avanzada.',    tags:['sin anuncios','anti-ban','temas','premium'],  download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.whatsapp' },
  { category:'apk',     name:'YouTube Premium APK',     version:'v19.10.2',   emoji:'▶️', desc:'YouTube premium desbloqueado: sin anuncios, reproducción en segundo plano y descarga de videos.',tags:['sin anuncios','fondo','premium'],             download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.google.android.youtube' },
  { category:'apk',     name:'Spotify Mod',             version:'v8.9.12',    emoji:'🎵', desc:'Spotify con cuenta premium gratis. Sin límites, sin anuncios y calidad de audio máxima.',     tags:['premium','sin anuncios','offline'],            download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.spotify.music' },
  { category:'apk',     name:'Netflix Premium Mod',     version:'v8.88.0',    emoji:'🎬', desc:'Netflix desbloqueado con calidad 4K, descargas sin límite y acceso a todo el catálogo.',      tags:['4K','premium','sin límite'],                  download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.netflix.mediaclient' },
  { category:'game',    name:'Roblox Mod Menu',         version:'v2.625.660', emoji:'🟥', desc:'Roblox con menú de modificaciones: volar, speed hack y herramientas exclusivas.',             tags:['fly','speed','mod menu'],                     download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.roblox.client' },
  { category:'game',    name:'Minecraft PE Premium',    version:'v1.20.81',   emoji:'⛏️', desc:'Minecraft Bedrock Edition completa. Marketplace gratis y skins premium desbloqueados.',       tags:['premium','marketplace','gratis'],              download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.mojang.minecraftpe' },
  { category:'game',    name:'Free Fire Max Mod',       version:'v2.106.1',   emoji:'🔥', desc:'Free Fire con diamantes infinitos, skins desbloqueados y anti-ban integrado.',                tags:['diamantes','skins','anti-ban'],                download:'https://mediafire.com/', playstore:'https://play.google.com/store/apps/details?id=com.dts.freefiremax' },
  { category:'script',  name:'Script Blox Fruits',      version:'v5.2',       emoji:'⚙️', desc:'Script Lua para Blox Fruits: Auto Farm, Auto Quest, Devil Fruit ESP y más funciones.',       tags:['auto farm','ESP','lua','roblox'],              download:'https://mediafire.com/', playstore:'https://www.roblox.com/games/2753915549' },
  { category:'script',  name:'AHK Scripts Pack',        version:'v2.0',       emoji:'🔩', desc:'20+ scripts AutoHotKey para gaming: macros, aim assist, rapid fire y más.',                  tags:['AHK','macro','gaming'],                       download:'https://mediafire.com/', playstore:'https://github.com/' },
  { category:'tutorial',name:'Cómo instalar APKs Mod',  version:'2024',       emoji:'📖', desc:'Tutorial completo para instalar APKs modificadas en Android de forma segura y sin errores.', tags:['android','instalación','básico'],              download:'https://www.youtube.com/@JOZETHCPM1', playstore:'https://www.youtube.com/@JOZETHCPM1' },
  { category:'tutorial',name:'Scripts Roblox: Inicio',  version:'2024',       emoji:'🎓', desc:'Aprende a usar scripts en Roblox desde cero: executor, instalación y ejecución.',            tags:['roblox','executor','beginner'],                download:'https://www.youtube.com/@JOZETHCPM1', playstore:'https://www.youtube.com/@JOZETHCPM1' },
];

/* ══════════════════════════════════════════════════════════════════════════
   ↓ NO ES NECESARIO EDITAR NADA DEBAJO DE ESTA LÍNEA ↓
   ══════════════════════════════════════════════════════════════════════════ */

/* ─── ESTADO GLOBAL ──────────────────────────────────────────────────────── */
let db            = null;   // instancia Firestore
let allContent    = [];     // cache local
let adminUnlocked = false;  // ¿panel desbloqueado con PIN?
let activeFilter  = 'all';
let searchQuery   = '';

/* ══════════════════════════════════════════════════════════════════════════
   FIREBASE
   ══════════════════════════════════════════════════════════════════════════ */

async function initFirebase() {
  // Si el usuario no reemplazó las credenciales, mostrar aviso y usar modo local
  if (FIREBASE_CONFIG.apiKey === "TU_API_KEY") {
    showFirebaseWarning();
    allContent = SEED_CONTENT.map((item, i) => ({ ...item, id: 'local_' + i, createdAt: Date.now() }));
    renderAllGrids();
    return;
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp }
      = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);

    // Guardar helpers en objeto global para usarlos en funciones asíncronas
    window._fs = { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp };

    await loadContent();

    // Si Firestore está vacío, subir contenido inicial
    if (allContent.length === 0) {
      await seedContent();
      await loadContent();
    }

  } catch (err) {
    console.error('Firebase error:', err);
    showToast('⚠️ Error conectando con Firebase. Revisa tu configuración.', 'error');
    // Fallback: mostrar seed local
    allContent = SEED_CONTENT.map((item, i) => ({ ...item, id: 'local_' + i }));
    renderAllGrids();
  }
}

async function loadContent() {
  showLoadingSkeleton();
  try {
    const { collection, getDocs, query, orderBy } = window._fs;
    const snap = await getDocs(query(collection(db, 'content'), orderBy('createdAt', 'desc')));
    allContent  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAllGrids();
    updateAdminList();
  } catch (err) {
    console.error('Error cargando contenido:', err);
    showToast('Error al cargar contenido.', 'error');
  }
}

async function seedContent() {
  const { collection, addDoc, serverTimestamp } = window._fs;
  const col = collection(db, 'content');
  for (const item of SEED_CONTENT) {
    await addDoc(col, { ...item, createdAt: serverTimestamp() });
  }
}

async function addContent(data) {
  if (!db) {
    // Modo local sin Firebase
    allContent.unshift({ ...data, id: 'local_' + Date.now(), createdAt: Date.now() });
    renderAllGrids();
    updateAdminList();
    return true;
  }
  try {
    const { collection, addDoc, serverTimestamp } = window._fs;
    await addDoc(collection(db, 'content'), { ...data, createdAt: serverTimestamp() });
    await loadContent();
    return true;
  } catch (err) {
    console.error('Error agregando:', err);
    return false;
  }
}

async function deleteContent(id) {
  if (!db || String(id).startsWith('local_')) {
    allContent = allContent.filter(x => x.id !== id);
    renderAllGrids();
    updateAdminList();
    return;
  }
  try {
    const { doc, deleteDoc } = window._fs;
    await deleteDoc(doc(db, 'content', id));
    await loadContent();
  } catch (err) {
    console.error('Error eliminando:', err);
    showToast('Error al eliminar.', 'error');
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   RENDER / UI
   ══════════════════════════════════════════════════════════════════════════ */

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getCategoryLabel(c) { return {apk:'APK App',game:'Juego Mod',script:'Script',tutorial:'Tutorial'}[c]||c; }
function getBadgeClass(c)    { return {apk:'',game:'game',script:'script',tutorial:'tutorial'}[c]||''; }
function getDownloadLabel(c) { return c==='tutorial'?'▶️ Ver Tutorial':'⬇️ Descargar'; }
function getSecondaryLabel(c){ if(c==='tutorial')return'🎬 YouTube'; if(c==='script')return'🔗 Ver Fuente'; return '▶️ Google Play'; }
function getSecondaryClass(c){ return c==='tutorial'?'btn-yt':'btn-play'; }

/* ─── CARD ───────────────────────────────────────────────────────────────── */

function renderCard(item) {
  const tags = (item.tags||[]).map(t=>`<span class="tag">${escHtml(t)}</span>`).join('');
  return `
    <div class="card" data-id="${escHtml(item.id)}" data-category="${item.category}">
      <div class="card-thumb">
        <span>${item.emoji||'📦'}</span>
        <span class="card-badge ${getBadgeClass(item.category)}">${getCategoryLabel(item.category)}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escHtml(item.name)}</div>
        <div class="card-version">${escHtml(item.version||'v1.0')}</div>
        <div class="card-desc">${escHtml(item.desc)}</div>
        <div class="card-tags">${tags}</div>
        <div class="card-actions">
          <a href="${escHtml(item.download||'#')}" target="_blank" rel="noopener" class="btn btn-download" onclick="event.stopPropagation()">
            ${getDownloadLabel(item.category)}
          </a>
          <a href="${escHtml(item.playstore||'#')}" target="_blank" rel="noopener" class="btn ${getSecondaryClass(item.category)}" onclick="event.stopPropagation()">
            ${getSecondaryLabel(item.category)}
          </a>
        </div>
      </div>
    </div>`;
}

function renderEmpty(msg) {
  return `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">${msg}</div></div>`;
}

/* ─── SKELETON LOADER ────────────────────────────────────────────────────── */

function showLoadingSkeleton() {
  ['apkGrid','gamesGrid','scriptsGrid','tutorialsGrid'].forEach(id => {
    const g = document.getElementById(id);
    if (!g) return;
    g.innerHTML = Array(3).fill(`
      <div class="card" style="pointer-events:none">
        <div class="card-thumb skeleton" style="height:150px;border-radius:0"></div>
        <div class="card-body">
          <div class="skeleton" style="height:18px;width:70%;margin-bottom:10px;border-radius:6px"></div>
          <div class="skeleton" style="height:12px;width:40%;margin-bottom:14px;border-radius:4px"></div>
          <div class="skeleton" style="height:50px;margin-bottom:14px;border-radius:6px"></div>
          <div class="skeleton" style="height:36px;border-radius:8px"></div>
        </div>
      </div>`).join('');
  });
}

/* ─── RENDER GRIDS ───────────────────────────────────────────────────────── */

function renderAllGrids() {
  const gridMap    = {apk:'apkGrid',game:'gamesGrid',script:'scriptsGrid',tutorial:'tutorialsGrid'};
  const sectionMap = {apk:'apk',game:'games',script:'scripts',tutorial:'tutorials'};
  const q = searchQuery.toLowerCase().trim();

  Object.entries(gridMap).forEach(([cat, gridId]) => {
    const grid    = document.getElementById(gridId);
    const section = document.getElementById(sectionMap[cat]);
    if (!grid) return;

    if (activeFilter !== 'all' && activeFilter !== cat) {
      if (section) section.style.display = 'none';
      return;
    }
    if (section) section.style.display = '';

    const items = allContent.filter(item => {
      if (item.category !== cat) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) ||
             item.desc.toLowerCase().includes(q) ||
             (item.tags||[]).some(t=>t.toLowerCase().includes(q));
    });

    if (!items.length) {
      grid.innerHTML = renderEmpty(q ? `Sin resultados para "${escHtml(q)}"` : 'No hay contenido todavía.');
      return;
    }

    grid.innerHTML = items.map(renderCard).join('');
    grid.querySelectorAll('.card').forEach((card, i) => {
      card.style.animationDelay = `${i*0.06}s`;
      card.addEventListener('click', () => openModal(card.dataset.id));
    });
  });

  // Actualizar contadores del hero con datos reales
  const counts = {apk:0,game:0,script:0,tutorial:0};
  allContent.forEach(x => { if (counts[x.category]!==undefined) counts[x.category]++; });
  const statEls  = document.querySelectorAll('[data-target]');
  const labelEls = document.querySelectorAll('.stat-label');
  const lMap     = {'APKs':'apk','Juegos':'game','Scripts':'script','Tutoriales':'tutorial'};
  labelEls.forEach((label, i) => {
    const cat = lMap[label.textContent.trim()];
    if (cat && statEls[i]) statEls[i].textContent = (counts[cat]||0) + '+';
  });
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */

function openModal(id) {
  const item = allContent.find(x => String(x.id) === String(id));
  if (!item) return;
  const tags = (item.tags||[]).map(t=>`<span class="tag">${escHtml(t)}</span>`).join('');

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-hero">${item.emoji||'📦'}</div>
    <div class="modal-title">${escHtml(item.name)}</div>
    <div class="modal-version">Versión ${escHtml(item.version||'v1.0')} · ${getCategoryLabel(item.category)}</div>
    <div class="modal-tags">${tags}</div>
    <p class="modal-desc">${escHtml(item.desc)}</p>
    <div class="modal-actions">
      <a href="${escHtml(item.download||'#')}" target="_blank" rel="noopener" class="btn btn-download">
        ${getDownloadLabel(item.category)}
      </a>
      <a href="${escHtml(item.playstore||'#')}" target="_blank" rel="noopener" class="btn ${getSecondaryClass(item.category)}">
        ${getSecondaryLabel(item.category)}
      </a>
    </div>`;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });
}

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN PANEL
   ══════════════════════════════════════════════════════════════════════════ */

function initAdmin() {
  /* ── Verificación de PIN ── */
  const pinOverlay   = document.getElementById('adminPinOverlay');
  const pinInput     = document.getElementById('adminPinInput');
  const pinSubmit    = document.getElementById('adminPinSubmit');
  const pinError     = document.getElementById('adminPinError');
  const adminContent = document.getElementById('adminContent');

  pinSubmit.addEventListener('click', () => {
    if (pinInput.value === ADMIN_PIN) {
      adminUnlocked = true;
      pinOverlay.style.display  = 'none';
      adminContent.style.display = 'block';
      pinError.textContent = '';
      updateAdminList();
    } else {
      pinError.textContent = '❌ PIN incorrecto.';
      pinInput.value = '';
      pinInput.focus();
      // Efecto shake
      pinOverlay.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}], {duration:300});
    }
  });
  pinInput.addEventListener('keydown', e => { if(e.key==='Enter') pinSubmit.click(); });

  /* ── Formulario agregar contenido ── */
  document.getElementById('adminSubmit').addEventListener('click', async () => {
    const name      = document.getElementById('adminName').value.trim();
    const category  = document.getElementById('adminCategory').value;
    const version   = document.getElementById('adminVersion').value.trim() || 'v1.0';
    const emoji     = document.getElementById('adminEmoji').value.trim() || '📦';
    const desc      = document.getElementById('adminDesc').value.trim();
    const download  = document.getElementById('adminDownload').value.trim() || '#';
    const playstore = document.getElementById('adminPlayStore').value.trim() || '#';
    const tagsRaw   = document.getElementById('adminTags').value.trim();
    const tags      = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : [];

    if (!name) return showToast('⚠️ El nombre es obligatorio.', 'error');
    if (!desc) return showToast('⚠️ La descripción es obligatoria.', 'error');

    const btn = document.getElementById('adminSubmit');
    btn.innerHTML = '<span>⏳ Guardando...</span>';
    btn.disabled  = true;

    const ok = await addContent({ name, category, version, emoji, desc, tags, download, playstore });

    btn.innerHTML = '<span>➕ Agregar Contenido</span>';
    btn.disabled  = false;

    if (ok) {
      clearAdminForm();
      showToast('✅ Guardado en Firebase correctamente.', 'success');
      const sMap = {apk:'apk',game:'games',script:'scripts',tutorial:'tutorials'};
      setTimeout(() => smoothScrollTo(sMap[category]||'apk'), 600);
    } else {
      showToast('❌ Error al guardar. Revisa la consola.', 'error');
    }
  });

  document.getElementById('adminClear').addEventListener('click', clearAdminForm);
}

/* Lista de ítems existentes en el panel admin, con botón de eliminar */
function updateAdminList() {
  if (!adminUnlocked) return;
  const container = document.getElementById('adminCurrentList');
  if (!container) return;

  if (!allContent.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px 0">No hay contenido todavía.</p>';
    return;
  }

  container.innerHTML = allContent.map(item => `
    <div class="admin-list-item">
      <span class="admin-list-emoji">${item.emoji||'📦'}</span>
      <div class="admin-list-info">
        <strong>${escHtml(item.name)}</strong>
        <span>${getCategoryLabel(item.category)} · ${escHtml(item.version||'')}</span>
      </div>
      <button class="admin-delete-btn" data-id="${escHtml(item.id)}" title="Eliminar">🗑️</button>
    </div>`).join('');

  container.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = allContent.find(x => x.id === btn.dataset.id);
      if (!confirm(`¿Eliminar "${item?.name}"?`)) return;
      btn.textContent = '⏳';
      btn.disabled = true;
      await deleteContent(btn.dataset.id);
      showToast('🗑️ Eliminado correctamente.', 'success');
    });
  });
}

function clearAdminForm() {
  ['adminName','adminVersion','adminEmoji','adminDesc','adminDownload','adminPlayStore','adminTags']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('adminCategory').value = 'apk';
}

/* ══════════════════════════════════════════════════════════════════════════
   SEARCH
   ══════════════════════════════════════════════════════════════════════════ */

function initSearch() {
  const input    = document.getElementById('globalSearch');
  const clearBtn = document.getElementById('searchClear');
  const pills    = document.querySelectorAll('.pill');
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { searchQuery = input.value; renderAllGrids(); }, 200);
  });

  clearBtn.addEventListener('click', () => {
    input.value = ''; searchQuery = ''; renderAllGrids(); input.focus();
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      renderAllGrids();
      const map = {apk:'apk',game:'games',script:'scripts',tutorial:'tutorials'};
      if (activeFilter !== 'all' && map[activeFilter]) smoothScrollTo(map[activeFilter]);
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════════════════════ */

function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); });
  });

  document.querySelectorAll('[href^="#"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); smoothScrollTo(a.getAttribute('href').replace('#','')); });
  });

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting)
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section===entry.target.id));
    });
  }, { threshold: 0.35 });
  ['home','apk','games','scripts','tutorials'].forEach(id => { const el=document.getElementById(id); if(el) spy.observe(el); });
}

/* ══════════════════════════════════════════════════════════════════════════
   CURSOR / PARTÍCULAS / UTILITIES
   ══════════════════════════════════════════════════════════════════════════ */

function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  if (!cursor || !trail || window.matchMedia('(pointer:coarse)').matches) return;
  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursor.style.left=mx+'px'; cursor.style.top=my+'px'; });
  (function loop(){ tx+=(mx-tx)*.12; ty+=(my-ty)*.12; trail.style.left=tx+'px'; trail.style.top=ty+'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.card,.pill,.social-card').forEach(el => {
    el.addEventListener('mouseenter',()=>cursor.style.transform='translate(-50%,-50%) scale(2)');
    el.addEventListener('mouseleave',()=>cursor.style.transform='translate(-50%,-50%) scale(1)');
  });
}

function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W,H,P;
  const resize=()=>{ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
  const make=n=>Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,a:Math.random()}));
  resize(); P=make(80);
  window.addEventListener('resize',()=>{resize();P=make(80);},{passive:true});
  (function draw(){
    ctx.clearRect(0,0,W,H);
    P.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(0,245,255,${p.a*.5})`; ctx.fill();
    });
    for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){
      const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(P[i].x,P[i].y);ctx.lineTo(P[j].x,P[j].y);ctx.strokeStyle=`rgba(0,245,255,${(1-d/120)*.08})`;ctx.lineWidth=.5;ctx.stroke();}
    }
    requestAnimationFrame(draw);
  })();
}

function smoothScrollTo(id) {
  const el=document.getElementById(id); if(!el) return;
  const navH=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||68;
  window.scrollTo({top:el.getBoundingClientRect().top+window.pageYOffset-navH-20,behavior:'smooth'});
}

function showToast(msg, type='success') {
  document.querySelector('.toast')?.remove();
  const t=document.createElement('div');
  t.className='toast';
  t.textContent=msg;
  t.style.cssText=`position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
    background:${type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--accent)'};
    color:${type==='success'||type==='error'?'#fff':'var(--bg-deep)'};
    padding:12px 24px;border-radius:10px;font-family:var(--font-display);font-size:.75rem;
    letter-spacing:1px;z-index:4000;opacity:0;transition:all .3s ease;
    box-shadow:0 8px 30px rgba(0,0,0,.3);white-space:nowrap;max-width:90vw;text-align:center;`;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; setTimeout(()=>t.remove(),350); },3000);
}

function showFirebaseWarning() {
  if (document.getElementById('firebaseWarning')) return;
  const b=document.createElement('div'); b.id='firebaseWarning';
  b.innerHTML=`<div style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
    background:#f59e0b;color:#1a1000;padding:12px 20px;border-radius:12px;
    font-family:var(--font-display);font-size:.72rem;letter-spacing:1px;z-index:3000;
    text-align:center;max-width:440px;box-shadow:0 8px 30px rgba(0,0,0,.4);">
    ⚠️ Firebase no configurado — modo local activo (datos no se guardan entre sesiones).<br>
    <span style="opacity:.8;font-size:.65rem">Sigue el archivo SETUP.md para activarlo.</span>
    <button onclick="document.getElementById('firebaseWarning').remove()"
      style="margin-left:12px;background:rgba(0,0,0,.2);border:none;color:inherit;
             padding:2px 8px;border-radius:6px;cursor:pointer">✕</button>
  </div>`;
  document.body.appendChild(b);
}

/* ══════════════════════════════════════════════════════════════════════════
   ARRANQUE
   ══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  initAdmin();
  initCursor();
  initParticles();
  initModal();

  document.getElementById('scrollTop').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  // Conectar con Firebase y cargar contenido
  initFirebase();
});
