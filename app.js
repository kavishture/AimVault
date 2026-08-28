(() => {
  const $ = s => document.querySelector(s);
  const KEY = 'aimvault-copy-counts';
  const search = $('#searchInput'), sort = $('#sort');
  const counts = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const copyCount = id => Number(counts()[id] || 0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const imageHTML = x => `<img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy" onerror="this.outerHTML='<div class=\'unavailable\'>Image unavailable</div>'">`;
  const card = x => `<article class="card"><div class="card-image">${imageHTML(x)}</div><div class="card-body"><h3>${esc(x.name)}</h3><div class="actions"><button class="copy" data-copy="${esc(x.id)}">COPY CODE</button><button class="view" data-view="${esc(x.id)}">VIEW</button></div></div></article>`;
  function filtered() {
    let list = [...(Array.isArray(window.CROSSHAIRS) ? CROSSHAIRS : [])];
    const q = search.value.trim().toLowerCase();
    if (q) list = list.filter(x => String(x.name || '').toLowerCase().includes(q));
    if (sort.value === 'name') list.sort((a,b) => String(a.name).localeCompare(String(b.name)));
    if (sort.value === 'copied') list.sort((a,b) => copyCount(b.id)-copyCount(a.id));
    return list;
  }
  function render() {
    const data = Array.isArray(CROSSHAIRS) ? CROSSHAIRS : [];
    const list = filtered();
    $('#count').textContent = data.length;
    $('#proCount').textContent = data.filter(x => (x.tags || []).some(t => String(t).toLowerCase() === 'pro')).length;
    $('#localCopies').textContent = Object.values(counts()).reduce((a,b) => a + Number(b || 0), 0);
    $('#allGrid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No crosshairs found.</div>';
    $('#recentGrid').innerHTML = data.length ? data.slice(0,4).map(card).join('') : '<div class="empty">No crosshairs added yet.</div>';
    const popular = data.filter(x => copyCount(x.id) > 0).sort((a,b) => copyCount(b.id)-copyCount(a.id)).slice(0,4);
    $('#popularGrid').innerHTML = popular.length ? popular.map(card).join('') : '<div class="empty">No local copies yet.</div>';
  }
  async function copy(id, btn) {
    const item = CROSSHAIRS.find(x => x.id === id); if (!item) return;
    try { await navigator.clipboard.writeText(item.code || ''); } catch { const t=document.createElement('textarea'); t.value=item.code||''; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    const c=counts(); c[id]=(c[id]||0)+1; localStorage.setItem(KEY,JSON.stringify(c));
    btn.textContent='COPIED ✓'; setTimeout(()=>btn.textContent='COPY CODE',1100); render();
  }
  function view(id) {
    const x=CROSSHAIRS.find(i=>i.id===id); if(!x)return;
    $('#detailImage').innerHTML=imageHTML(x); $('#detailName').textContent=x.name; $('#detailCode').textContent=x.code||'No code added.'; $('#detailCount').textContent=`Local browser copies: ${copyCount(x.id)}`; $('#detailCopy').dataset.copy=x.id; $('#modal').hidden=false; document.body.classList.add('locked');
  }
  document.addEventListener('click', e => { const c=e.target.closest('[data-copy]'); if(c){copy(c.dataset.copy,c);return;} const v=e.target.closest('[data-view]'); if(v){view(v.dataset.view);return;} if(e.target.closest('[data-close]')){$('#modal').hidden=true;document.body.classList.remove('locked');} if(e.target.closest('#menu'))$('#mobileNav').classList.toggle('open'); });
  search.addEventListener('input',render); sort.addEventListener('change',render); render();
})();
