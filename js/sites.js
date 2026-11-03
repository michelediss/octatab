import { applyIcon } from './favicon.js';
import { calculateTopSitesVerticalShift, createElement, escapeForLabel } from './utils.js';

let draggedSiteId = null;
const gridObservers = new WeakMap();

export function renderSites({ grid, emptyState, sites, onEdit, onRemove, onReorder }) {
  grid.replaceChildren();
  emptyState.toggleAttribute('hidden', sites.length !== 0);
  sites.forEach((site, index) => grid.append(createTile(site, index, sites, onEdit, onRemove, onReorder)));
  observeGridLayout(grid);
  updateGridVerticalPosition(grid);
  window.requestAnimationFrame(() => updateGridVerticalPosition(grid));
}

export function getGridColumnCount(grid) {
  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean);
  return Math.max(1, columns.length);
}

function getGridRowPitch(grid, columnCount) {
  const tiles = [...grid.children];
  const firstTile = tiles[0];
  if (!firstTile) return 0;
  const nextRowTile = tiles[columnCount];
  if (nextRowTile) return nextRowTile.getBoundingClientRect().top - firstTile.getBoundingClientRect().top;
  const rowGap = Number.parseFloat(getComputedStyle(grid).rowGap) || 0;
  return firstTile.getBoundingClientRect().height + rowGap;
}

function updateGridVerticalPosition(grid) {
  const siteCount = grid.children.length;
  if (!siteCount) {
    grid.style.setProperty('--top-sites-vertical-shift', '0px');
    return;
  }
  const columnCount = getGridColumnCount(grid);
  const rowCount = Math.ceil(siteCount / columnCount);
  const rowPitch = getGridRowPitch(grid, columnCount);
  const shift = calculateTopSitesVerticalShift(rowCount, rowPitch);
  grid.style.setProperty('--top-sites-vertical-shift', `${shift}px`);
}

function observeGridLayout(grid) {
  if (gridObservers.has(grid) || !('ResizeObserver' in window)) return;
  const observer = new ResizeObserver(() => updateGridVerticalPosition(grid));
  observer.observe(grid);
  gridObservers.set(grid, observer);
}

function createTile(site, index, sites, onEdit, onRemove, onReorder) {
  const article = createElement('article', 'site-tile');
  article.draggable = true;
  article.dataset.siteId = site.id;
  article.setAttribute('aria-label', `${site.title}. Trascina per riordinare.`);
  const link = createElement('a', 'site-link');
  link.href = site.url;
  link.target = '_self';
  link.draggable = false;
  link.setAttribute('aria-label', `Apri ${escapeForLabel(site.title)}`);
  const icon = createElement('span', 'site-icon');
  applyIcon(icon, site, 32);
  link.append(icon, createElement('span', 'site-title', site.title));
  const menuButton = createElement('button', 'site-menu-button');
  menuButton.type = 'button'; menuButton.setAttribute('aria-label', `Azioni per ${site.title}`); menuButton.setAttribute('aria-expanded', 'false');
  menuButton.append(createElement('span', 'dots', '•••'));
  const menu = createElement('div', 'tile-menu'); menu.hidden = true;
  const edit = createElement('button', 'tile-menu-item', 'Modifica'); edit.type = 'button';
  const moveBack = createElement('button', 'tile-menu-item', 'Sposta indietro'); moveBack.type = 'button'; moveBack.disabled = index === 0;
  const moveForward = createElement('button', 'tile-menu-item', 'Sposta avanti'); moveForward.type = 'button'; moveForward.disabled = index === sites.length - 1;
  const remove = createElement('button', 'tile-menu-item tile-menu-danger', 'Rimuovi'); remove.type = 'button';
  menu.append(edit, moveBack, moveForward, remove);
  menuButton.addEventListener('click', (event) => { event.stopPropagation(); const open = !menu.hidden; closeAllMenus(); menu.hidden = open; menuButton.setAttribute('aria-expanded', String(!open)); if (!open) edit.focus(); });
  edit.addEventListener('click', () => { closeAllMenus(); onEdit(site); });
  moveBack.addEventListener('click', () => { closeAllMenus(); onReorder(site.id, index - 1); });
  moveForward.addEventListener('click', () => { closeAllMenus(); onReorder(site.id, index + 1); });
  remove.addEventListener('click', () => { closeAllMenus(); onRemove(site); });
  article.addEventListener('dragstart', (event) => {
    if (event.target.closest('button')) { event.preventDefault(); return; }
    draggedSiteId = site.id;
    event.dataTransfer?.setData('text/plain', site.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    window.requestAnimationFrame(() => article.classList.add('is-dragging'));
  });
  article.addEventListener('dragover', (event) => {
    const sourceId = draggedSiteId;
    if (!sourceId || sourceId === site.id) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    article.classList.add('is-drop-target');
  });
  article.addEventListener('dragleave', () => article.classList.remove('is-drop-target'));
  article.addEventListener('drop', (event) => {
    event.preventDefault();
    const sourceId = draggedSiteId || event.dataTransfer?.getData('text/plain');
    article.classList.remove('is-drop-target');
    if (sourceId && sourceId !== site.id) onReorder(sourceId, index);
  });
  article.addEventListener('dragend', clearDragState);
  article.append(link, menuButton, menu);
  return article;
}

function closeAllMenus() { document.querySelectorAll('.tile-menu:not([hidden])').forEach((menu) => { menu.hidden = true; const button = menu.previousElementSibling; button?.setAttribute('aria-expanded', 'false'); }); }
function clearDragState() { draggedSiteId = null; document.querySelectorAll('.site-tile.is-dragging, .site-tile.is-drop-target').forEach((tile) => tile.classList.remove('is-dragging', 'is-drop-target')); }
document.addEventListener('click', closeAllMenus);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAllMenus(); });
document.addEventListener('focusin', (event) => { if (!event.target.closest('.site-tile')) closeAllMenus(); });
