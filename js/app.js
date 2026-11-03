import { addSite, loadData, removeSite, reorderSite, updateSite } from './storage.js';
import { createSiteRecord, updateSiteRecord } from './validation.js';
import { renderSites } from './sites.js';
import { createDialogController, createConfirmController } from './dialog.js';
import { announce, formatSiteCount } from './utils.js';

const byId = (id) => document.getElementById(id);
const elements = { grid: byId('sites-grid'), emptyState: byId('empty-state'), count: byId('site-count'), status: byId('status-region'), addButton: byId('add-site-button'), emptyAddButton: byId('empty-add-button') };
const dialog = createDialogController({ dialog: byId('site-dialog'), form: byId('site-form'), titleInput: byId('site-title'), urlInput: byId('site-url'), autoRadio: byId('icon-auto'), customRadio: byId('icon-custom'), customField: byId('custom-icon-field'), fileInput: byId('custom-icon'), preview: byId('icon-preview'), previewImage: byId('preview-image'), titleError: byId('title-error'), urlError: byId('url-error'), imageError: byId('image-error'), formError: byId('form-error'), heading: byId('dialog-title'), saveButton: byId('dialog-save'), closeButton: byId('dialog-close'), cancelButton: byId('dialog-cancel') }, { onSave: persistDialog });
const confirm = createConfirmController(byId('confirm-dialog'), byId('confirm-copy'), byId('confirm-cancel'), async (site) => { try { await removeSite(site.id); await refresh(); announce(elements.status, 'Sito rimosso.'); } catch { announce(elements.status, 'Non è stato possibile rimuovere il sito.'); } });
let sites = [];

async function refresh() { const data = await loadData(); sites = data.topSites; elements.count.textContent = formatSiteCount(sites.length); renderSites({ grid: elements.grid, emptyState: elements.emptyState, sites, onEdit: (site) => dialog.open('edit', site, document.activeElement), onRemove: (site) => confirm.open(site, document.activeElement), onReorder: reorder }); }
async function persistDialog({ mode, site, title, url, iconMode, customDataUrl }) { if (mode === 'add') { await addSite(createSiteRecord({ title, url, iconMode, customDataUrl })); announce(elements.status, 'Sito aggiunto.'); } else { await updateSite(site.id, (current) => updateSiteRecord(current, { title, url, iconMode, customDataUrl })); announce(elements.status, 'Sito aggiornato.'); } await refresh(); }
async function reorder(id, destinationIndex) { try { await reorderSite(id, destinationIndex); await refresh(); announce(elements.status, 'Ordine dei siti aggiornato.'); } catch (error) { announce(elements.status, error.message || 'Non è stato possibile riordinare i siti.'); } }
function openAdd() { elements.addButton.focus(); dialog.open('add', null, elements.addButton); }
elements.addButton.addEventListener('click', openAdd); elements.emptyAddButton.addEventListener('click', openAdd);
if (chrome.storage?.onChanged) chrome.storage.onChanged.addListener((changes, areaName) => { if (areaName === 'local' && changes.topSitesData) refresh().catch(() => announce(elements.status, 'Impossibile aggiornare i siti.')); });
refresh().catch((error) => { elements.count.textContent = 'Dati non disponibili'; announce(elements.status, error.message || 'Impossibile caricare i siti.'); });
