(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const COPY_KEY = "aimvault_copy_counts";
  const state = { query: "", filter: "all", sort: "recent" };
  let currentDetail = null;
  let previewLogical = null;

  const copyCounts = JSON.parse(localStorage.getItem(COPY_KEY) || "{}");
  const saveCounts = () => localStorage.setItem(COPY_KEY, JSON.stringify(copyCounts));
  const countFor = (id) => Number(copyCounts[id] || 0);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
  }

  function tagsHtml(tags) {
    return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  }

  function imageHtml(item) {
    return `<div class="card-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} crosshair" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=&quot;image-unavailable&quot;>Image unavailable</span>'"></div>`;
  }

  function card(item) {
    return `<article class="crosshair-card">
      ${imageHtml(item)}
      <div class="card-body">
        <div class="card-title-row"><h3>${escapeHtml(item.name)}</h3><span class="copy-count">${countFor(item.id)} copies</span></div>
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
    if (state.sort === "name") copy.sort((a,b) => a.name.localeCompare(b.name));
    if (state.sort === "copied") copy.sort((a,b) => countFor(b.id) - countFor(a.id) || a.name.localeCompare(b.name));
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
    $("#recentGrid").innerHTML = CROSSHAIRS.slice(0, 4).map(card).join("");
    const copied = [...CROSSHAIRS].sort((a,b) => countFor(b.id) - countFor(a.id) || CROSSHAIRS.indexOf(a) - CROSSHAIRS.indexOf(b)).slice(0, 4);
    $("#copiedGrid").innerHTML = copied.map(card).join("");
    $("#stats").innerHTML = `
      <div><strong>${CROSSHAIRS.length}</strong><span>Crosshairs</span></div>
      <div><strong>${new Set(CROSSHAIRS.flatMap(x => x.tags.filter(t => t === "pro"))).size || 0}</strong><span>Pro Styles</span></div>
      <div><strong>1</strong><span>Click Copy</span></div>`;
    bindCardButtons();
  }

  function bindCardButtons() {
    $$("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
      const item = CROSSHAIRS.find(x => x.id === btn.dataset.copy);
      if (item) copyCode(item, btn);
    }));
    $$("[data-view]").forEach(btn => btn.addEventListener("click", () => {
      const item = CROSSHAIRS.find(x => x.id === btn.dataset.view);
      if (item) openDetail(item);
    }));
  }

  async function copyCode(item, button) {
    try {
      await navigator.clipboard.writeText(item.code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.code; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    copyCounts[item.id] = countFor(item.id) + 1;
    saveCounts();
    const old = button.textContent;
    button.textContent = "COPIED ✓";
    button.classList.add("copied");
    showToast(`${item.name} code copied`);
    setTimeout(() => { button.textContent = old; button.classList.remove("copied"); }, 1300);
    renderHomeSections(); renderAll();
    if (currentDetail?.id === item.id) $("#modalCopies").textContent = `${countFor(item.id)} copies`;
  }

  function openDetail(item) {
    currentDetail = item;
    $("#modalImage").src = item.image;
    $("#modalImage").alt = `${item.name} crosshair`;
    $("#modalImage").onerror = () => { $("#modalImage").replaceWith(Object.assign(document.createElement("span"), { className: "image-unavailable", textContent: "Image unavailable" })); };
    $("#modalTitle").textContent = item.name;
    $("#modalTags").innerHTML = tagsHtml(item.tags);
    $("#modalCode").textContent = item.code;
    $("#modalCopies").textContent = `${countFor(item.id)} copies`;
    const related = CROSSHAIRS.filter(x => x.id !== item.id && x.tags.some(t => item.tags.includes(t))).slice(0, 3);
    $("#relatedList").innerHTML = related.length ? related.map(x => `<button class="related-item" data-related="${x.id}">${escapeHtml(x.name)} <span>→</span></button>`).join("") : "<span class='muted'>No related crosshairs yet.</span>";
    $$(".related-item").forEach(b => b.addEventListener("click", () => openDetail(CROSSHAIRS.find(x => x.id === b.dataset.related))));
    $("#detailModal").classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    $("#detailModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
    currentDetail = null;
  }

  function showToast(text) {
    const t = $("#toast"); t.textContent = text; t.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function runPreview(code) {
    const msg = $("#validationMessage");
    try {
      const settings = AimVaultRenderer.parseValorantCode(code);
      previewLogical = AimVaultRenderer.renderCrosshair(settings);
      drawPreview(1);
      msg.textContent = "Crosshair parsed successfully.";
      msg.className = "validation-message success";
      $("#previewInfo").textContent = `${previewLogical.width} × ${previewLogical.height} logical pixels`;
    } catch (e) {
      previewLogical = null;
      const canvas = $("#crosshairCanvas"), ctx = canvas.getContext("2d");
      canvas.width = 1; canvas.height = 1; ctx.clearRect(0,0,1,1);
      msg.textContent = "Invalid Valorant crosshair code";
      msg.className = "validation-message error";
      $("#previewInfo").textContent = "No valid preview";
    }
  }

  function drawPreview(scale) {
    if (!previewLogical) return;
    const canvas = $("#crosshairCanvas");
    canvas.width = previewLogical.width * scale;
    canvas.height = previewLogical.height * scale;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(previewLogical, 0, 0, canvas.width, canvas.height);
  }

  function setupGenerator() {
    const tests = [
      ["Tiny 1px", "0;s;1;P;c;5;o;0;0t;1;0l;1;0v;1;0a;1;0g;0;1t;0;1l;0;1v;0;d;0"],
      ["Independent H/V", "0;s;1;P;c;6;o;0;0t;1;0l;2;0v;8;0a;1;0g;1;1t;0;1l;0;1v;0;d;0"],
      ["Center Dot + Outline", "0;s;1;P;c;1;o;1;h;1;t;1;d;1;z;1;a;1;0t;0;0l;0;0v;0;1t;0;1l;0;1v;0"],
      ["Large + Outer", "0;s;1;P;c;4;o;1;h;1;t;1;0t;2;0l;6;0v;10;0a;1;0g;2;1t;1;1l;3;1v;5;1a;0.5;1g;3;d;0"],
      ["Error Flags", "0;s;1;P;c;2;o;0;0t;1;0l;4;0v;4;0a;1;0g;2;0f;1;0b;1;1t;1;1l;2;1v;3;1a;1;1g;2;1f;1;1b;1;d;0"]
    ];
    $("#testCases").innerHTML = tests.map(([name, code]) => `<button class="test-code" data-test="${escapeHtml(code)}">${escapeHtml(name)}</button>`).join("");
    $$(".test-code").forEach(b => b.addEventListener("click", () => { $("#codeInput").value = b.dataset.test; runPreview(b.dataset.test); }));
    $("#previewBtn").addEventListener("click", () => runPreview($("#codeInput").value));
    $("#clearBtn").addEventListener("click", () => { $("#codeInput").value = ""; $("#validationMessage").textContent = ""; $("#previewInfo").textContent = "Paste a code to begin"; previewLogical = null; });
    $$(".mode-switch button").forEach(b => b.addEventListener("click", () => {
      $$(".mode-switch button").forEach(x => x.classList.remove("active")); b.classList.add("active"); drawPreview(Number(b.dataset.mode));
    }));
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
      const b = e.target.closest("[data-filter]"); if (!b) return;
      state.filter = b.dataset.filter; renderFilters(); renderAll();
    });
    $("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; renderAll(); });
    $("#menuToggle").addEventListener("click", () => {
      const nav = $("#mainNav"), open = nav.classList.toggle("open");
      $("#menuToggle").setAttribute("aria-expanded", String(open));
    });
    $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
    $$("[data-close-modal]").forEach(x => x.addEventListener("click", closeModal));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    $("#modalCopy").addEventListener("click", () => currentDetail && copyCode(currentDetail, $("#modalCopy")));
  }

  renderFilters();
  renderHomeSections();
  renderAll();
  setupSearch();
  setupNavigation();
  setupGenerator();
})();
