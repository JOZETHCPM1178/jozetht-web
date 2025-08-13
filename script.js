const state = { apps: [], filtered: [] };
const el = { grid:null, empty:null, q:null };

function sanitize(t){ const d=document.createElement('div'); d.textContent=t??''; return d.innerHTML; }

function parseDate(value){
  // admite YYYY-MM-DD o ISO; si no hay fecha, devuelve 0 para ir al final
  if(!value) return 0;
  const d = new Date(value);
  const n = d.getTime();
  return isNaN(n) ? 0 : n;
}

function sortRecentFirst(list){
  // 1) si hay 'fecha', ordenar por fecha desc
  const withDate = list.some(x => x.fecha);
  if(withDate){
    return [...list].sort((a,b)=>parseDate(b.fecha)-parseDate(a.fecha));
  }
  // 2) si hay 'createdAt' usarlo
  const withCreated = list.some(x => x.createdAt);
  if(withCreated){
    return [...list].sort((a,b)=>parseDate(b.createdAt)-parseDate(a.createdAt));
  }
  // 3) sin fecha: asumimos que el último añadido es el más reciente (orden inverso)
  return [...list].reverse();
}

function render(items){
  el.grid.innerHTML = "";
  if(!items.length){ el.empty.classList.remove('hidden'); return; }
  el.empty.classList.add('hidden');
  const frag = document.createDocumentFragment();
  items.forEach(app => {
    const card = document.createElement('article');
    card.className = "card";
    card.innerHTML = `
      <div class="thumb-wrap chrome-border">
        <img class="thumb" loading="lazy" src="${sanitize(app.imagen||app.image)}" alt="${sanitize(app.nombre||app.name)}">
      </div>
      <div class="body">
        <h3 class="title">${sanitize(app.nombre||app.name)}</h3>
        <div class="meta">
          <span class="badge">APK</span>
          <a class="btn btn-rainbow" href="${sanitize(app.link)}" target="_blank" rel="noopener"><span>Descargar</span></a>
        </div>
      </div>
    `;
    frag.appendChild(card);
  });
  el.grid.appendChild(frag);
}

async function load(){
  try{
    const res = await fetch('apps.json?ts='+Date.now());
    if(!res.ok) throw new Error('No se pudo cargar apps.json');
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    state.apps = sortRecentFirst(list);
    state.filtered = state.apps.slice();
    render(state.filtered);
  }catch(e){
    console.error(e);
    el.grid.innerHTML = '<div class="empty">Error al cargar la lista. Revisa <code>apps.json</code>.</div>';
  }
}

function setupSearch(){
  el.q.addEventListener('input', (ev)=>{
    const q = ev.target.value.toLowerCase().trim();
    if(!q){ state.filtered = state.apps.slice(); return render(state.filtered); }
    state.filtered = state.apps.filter(a => (a.nombre||a.name||'').toLowerCase().includes(q));
    render(state.filtered);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  el.grid = document.getElementById('grid');
  el.empty = document.getElementById('empty');
  el.q = document.getElementById('q');
  setupSearch();
  load();
});
