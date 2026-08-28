(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const COPY_KEY = "aimvault_copy_counts";
  const state = { query: "", filter: "all", sort: "recent" };
  let currentDetail = null;

  let copyCounts = {};
  try { copyCounts = JSON.parse(localStorage.getItem(COPY_KEY) || "{}"); } catch { copyCounts = {}; }

  const saveCounts = () => localStorage.setItem(COPY_KEY, JSON.stringify(copyCounts));
  const countFor = (id) => Number(copyCounts[id] || 0);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
  }

  function tagsHtml(tags) {
    return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  }

  function imageHtml(item) {
    return `<div class="card-image">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} crosshair" loading="lazy"
        onerror="this.onerror=null;this.parentElement.innerHTML='<span class=&quot;image-unavailable&quot;>Image unavailable</span>'">
    </div>`;
  }

  function card(item) {
    return `<article class="crosshair-card">
      ${imageHtml(item)}
      <div class="card-body">
        <div class="card-title-row">
          <h3>${escapeHtml(item.name)}</h3>
          <span class="copy-count">${countFor(item.id)} copies</span>
        </div>
        <div class="tag-row">${tagsHtml(item.tags)}</div>
        <div class="card-actions">
          <button class="btn btn-copy" data-copy="${escapeHtml(item.id)}">COPY CODE</button>
          <button class="btn btn-view" data-view="${escapeHtml(item.id)}">VIEW</button>
        </div>
      </div>
    </article>`;
  }

  function allTags() {
    return [...new Set(CROSSHAIRS.flatMap(x => x.tags))].sort((a, b) => a.localeCompare(b));
  }

  function renderFilters() {
    const filters = ["all", ...allTags()];
    $("#filterList").innerHTML = filters.map(f =>
      `<button class="filter-btn ${state.filter === f ? "active" : ""}" data-filter="${escapeHtml(f)}">${f === "all" ? "All" : escapeHtml(f)}</button>`
    ).join("");
  }

  function matches(item) {
    const q = state.query.toLowerCase();
    const textMatch = !q || item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    const filterMatch = state.filter === "all" || item.tags.includes(state.filter);
    return textMatch && filterMatch;
  }

  function sorted(items) {
    const copy = [...items];
    if (state.sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === "copied") copy.sort((a, b) => countFor(b.id) - countFor(a.id) || CROSSHAIRS.indexOf(a) - CROSSHAIRS.indexOf(b));
    return copy;
  }

  function renderAll() {
    const filtered = sorted(CROSSHAIRS.filter(matches));
    $("#allGrid").innerHTML = filtered.map(card).join("");
    $("#resultCount").textContent = `${filtered.length} ${filtered.length === 1 ? "crosshair" : "crosshairs"}`;
    $("#emptyState").classList.toggle("hidden", filtered.length !== 0);
    bindCardButtons();
  }

  function renderHomeSections() {
    $("#recentGrid").innerHTML = CROSSHAIRS.slice(0, 6).map(card).join("");
    const copied = [...CROSSHAIRS]
      .sort((a, b) => countFor(b.id) - countFor(a.id) || CROSSHAIRS.indexOf(a) - CROSSHAIRS.indexOf(b))
      .slice(0, 6);
    $("#copiedGrid").innerHTML = copied.map(card).join("");
    $("#stats").innerHTML = `
      <div><strong>${CROSSHAIRS.length}</strong><span>Crosshairs</span></div>
      <div><strong>${CROSSHAIRS.filter(x => x.tags.includes("pro")).length}</strong><span>Pro Styles</span></div>
      <div><strong>1</strong><span>Click Copy</span></div>`;
    bindCardButtons();
  }

  function bindCardButtons() {
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
      const item = CROSSHAIRS.find(x => x.id === btn.dataset.copy);
      if (item) copyCode(item, btn);
    }));
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      const item = CROSSHAIRS.find(x => x.id === btn.dataset.view);
      if (item) openDetail(item);
    }));
  }

  async function copyCode(item, button) {
    try {
      await navigator.clipboard.writeText(item.code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    copyCounts[item.id] = countFor(item.id) + 1;
    saveCounts();
    const old = button.textContent;
    button.textContent = "COPIED ✓";
    button.classList.add("copied");
    showToast(`${item.name} code copied`);
    setTimeout(() => { button.textContent = old; button.classList.remove("copied"); }, 1300);

    renderHomeSections();
    renderAll();
    if (currentDetail?.id === item.id) $("#modalCopies").textContent = `${countFor(item.id)} copies`;
  }

  function setModalImage(item) {
    const holder = $("#modalImage");
    holder.src = item.image;
    holder.alt = `${item.name} crosshair`;
    holder.onerror = () => {
      holder.onerror = null;
      holder.replaceWith(Object.assign(document.createElement("span"), {
        className: "image-unavailable",
        textContent: "Image unavailable"
      }));
    };
  }

  function openDetail(item) {
    currentDetail = item;
    $("#modalTitle").textContent = item.name;
    $("#modalTags").innerHTML = tagsHtml(item.tags);
    $("#modalCode").textContent = item.code;
    $("#modalCopies").textContent = `${countFor(item.id)} copies`;
    setModalImage(item);
    $("#detailModal").classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    $("#detailModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
    currentDetail = null;
  }

  function showToast(text) {
    const toast = $("#toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function setupSearch() {
    $("#headerSearch").addEventListener("input", e => {
      state.query = e.target.value.trim();
      renderAll();
      if (state.query && location.hash !== "#crosshairs") history.replaceState(null, "", "#crosshairs");
    });
  }

  function setupNavigation() {
    $("#filterList").addEventListener("click", e => {
      const button = e.target.closest("[data-filter]");
      if (!button) return;
      state.filter = button.dataset.filter;
      renderFilters();
      renderAll();
    });

    $("#sortSelect").addEventListener("change", e => {
      state.sort = e.target.value;
      renderAll();
    });

    $("#menuToggle").addEventListener("click", () => {
      const nav = $("#mainNav");
      const open = nav.classList.toggle("open");
      $("#menuToggle").setAttribute("aria-expanded", String(open));
    });

    $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
    $$('[data-close-modal]').forEach(x => x.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    $("#modalCopy").addEventListener("click", () => currentDetail && copyCode(currentDetail, $("#modalCopy")));
  }

  renderFilters();
  renderHomeSections();
  renderAll();
  setupSearch();
  setupNavigation();
})();
