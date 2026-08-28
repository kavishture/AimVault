(() => {
  "use strict";

  const COPY_KEY = "aimvault-copy-counts";
  let activeTag = "all";
  let selectedCrosshair = null;

  const $ = (selector) => document.querySelector(selector);
  const copyCounts = loadCopyCounts();

  const elements = {
    search: $("#searchInput"),
    sort: $("#sortSelect"),
    filters: $("#filters"),
    allGrid: $("#allGrid"),
    recentGrid: $("#recentGrid"),
    popularGrid: $("#popularGrid"),
    empty: $("#emptyState"),
    modal: $("#detailModal"),
    modalClose: $("#modalClose"),
    detailImage: $("#detailImage"),
    detailName: $("#detailName"),
    detailTags: $("#detailTags"),
    detailCode: $("#detailCode"),
    detailCopy: $("#detailCopy"),
    detailCopyCount: $("#detailCopyCount"),
    menuToggle: $("#menuToggle"),
    mainNav: $("#mainNav")
  };

  function loadCopyCounts() {
    try {
      return JSON.parse(localStorage.getItem(COPY_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCopyCounts() {
    localStorage.setItem(COPY_KEY, JSON.stringify(copyCounts));
  }

  function getCopyCount(id) {
    return Number(copyCounts[id] || 0);
  }

  function incrementCopy(id) {
    copyCounts[id] = getCopyCount(id) + 1;
    saveCopyCounts();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function imageMarkup(crosshair, className = "") {
    const alt = `${crosshair.name} crosshair`;
    return `
      <img class="${className}" src="${escapeHtml(crosshair.image)}" alt="${escapeHtml(alt)}"
           loading="lazy"
           onerror="this.hidden=true; this.nextElementSibling.hidden=false;">
      <span class="image-unavailable" hidden>Image unavailable</span>
    `;
  }

  function cardMarkup(crosshair) {
    const tags = (crosshair.tags || []).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="card">
        <div class="card-image">${imageMarkup(crosshair)}</div>
        <div class="card-body">
          <h3 title="${escapeHtml(crosshair.name)}">${escapeHtml(crosshair.name)}</h3>
          <div class="tags">${tags}</div>
          <div class="card-actions">
            <button class="copy-button" data-copy="${escapeHtml(crosshair.id)}">COPY CODE</button>
            <button class="view-button" data-view="${escapeHtml(crosshair.id)}">VIEW</button>
          </div>
        </div>
      </article>
    `;
  }

  function allTags() {
    return [...new Set(CROSSHAIRS.flatMap(item => item.tags || []))]
      .sort((a, b) => a.localeCompare(b));
  }

  function renderFilters() {
    const tags = allTags();
    elements.filters.innerHTML = [
      `<button class="filter ${activeTag === "all" ? "active" : ""}" data-tag="all">All</button>`,
      ...tags.map(tag =>
        `<button class="filter ${activeTag === tag ? "active" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
      )
    ].join("");
  }

  function filteredCrosshairs() {
    const query = elements.search.value.trim().toLowerCase();

    return CROSSHAIRS.filter(item => {
      const haystack = [item.id, item.name, ...(item.tags || [])].join(" ").toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesTag = activeTag === "all" || (item.tags || []).includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }

  function sorted(items, mode) {
    const copy = [...items];
    if (mode === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
    if (mode === "copied") return copy.sort((a, b) => getCopyCount(b.id) - getCopyCount(a.id));
    return copy; // crosshairs.js order = Recently Added
  }

  function render() {
    const items = filteredCrosshairs();
    const ordered = sorted(items, elements.sort.value);

    elements.allGrid.innerHTML = ordered.map(cardMarkup).join("");
    elements.empty.classList.toggle("show", ordered.length === 0);

    elements.recentGrid.innerHTML = CROSSHAIRS.slice(0, 6).map(cardMarkup).join("");

    const popular = [...CROSSHAIRS]
      .sort((a, b) => getCopyCount(b.id) - getCopyCount(a.id))
      .slice(0, 6);
    elements.popularGrid.innerHTML = popular.map(cardMarkup).join("");

    $("#crosshairCount").textContent = CROSSHAIRS.length;
    $("#proCount").textContent = CROSSHAIRS.filter(x => (x.tags || []).some(t => t.toLowerCase() === "pro")).length;
    $("#copyCount").textContent = Object.values(copyCounts).reduce((sum, n) => sum + Number(n || 0), 0);

    renderFilters();
  }

  async function copyCode(id, button) {
    const item = CROSSHAIRS.find(x => x.id === id);
    if (!item) return;

    try {
      await navigator.clipboard.writeText(item.code);
    } catch {
      const area = document.createElement("textarea");
      area.value = item.code;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    incrementCopy(id);
    const original = button.textContent;
    button.textContent = "COPIED ✓";
    render();
    setTimeout(() => {
      if (button.isConnected) button.textContent = original;
    }, 1200);
  }

  function openDetail(id) {
    const item = CROSSHAIRS.find(x => x.id === id);
    if (!item) return;

    selectedCrosshair = item;
    elements.detailImage.hidden = false;
    elements.detailImage.src = item.image;
    elements.detailImage.alt = `${item.name} crosshair`;
    elements.detailImage.onerror = () => {
      elements.detailImage.hidden = true;
    };
    elements.detailName.textContent = item.name;
    elements.detailTags.innerHTML = (item.tags || []).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join("");
    elements.detailCode.textContent = item.code;
    elements.detailCopyCount.textContent = `Local browser copies: ${getCopyCount(item.id)}`;
    elements.modal.hidden = false;
    document.body.style.overflow = "hidden";
    elements.modalClose.focus();
  }

  function closeDetail() {
    elements.modal.hidden = true;
    document.body.style.overflow = "";
    selectedCrosshair = null;
  }

  elements.search.addEventListener("input", render);
  elements.sort.addEventListener("change", render);

  elements.filters.addEventListener("click", event => {
    const button = event.target.closest("[data-tag]");
    if (!button) return;
    activeTag = button.dataset.tag;
    render();
  });

  document.addEventListener("click", event => {
    const copyButton = event.target.closest("[data-copy]");
    const viewButton = event.target.closest("[data-view]");

    if (copyButton) copyCode(copyButton.dataset.copy, copyButton);
    if (viewButton) openDetail(viewButton.dataset.view);
  });

  elements.detailCopy.addEventListener("click", () => {
    if (selectedCrosshair) copyCode(selectedCrosshair.id, elements.detailCopy);
    if (selectedCrosshair) elements.detailCopyCount.textContent = `Local browser copies: ${getCopyCount(selectedCrosshair.id)}`;
  });

  elements.modalClose.addEventListener("click", closeDetail);
  elements.modal.addEventListener("click", event => {
    if (event.target.hasAttribute("data-close-modal")) closeDetail();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !elements.modal.hidden) closeDetail();
  });

  elements.menuToggle.addEventListener("click", () => {
    const open = elements.mainNav.classList.toggle("open");
    elements.menuToggle.setAttribute("aria-expanded", String(open));
  });

  elements.mainNav.addEventListener("click", event => {
    if (event.target.matches("a")) {
      elements.mainNav.classList.remove("open");
      elements.menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  render();
})();
