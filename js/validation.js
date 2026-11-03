export const MAX_TITLE_LENGTH = 80;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateTitle(value) {
  const title = String(value ?? '').trim();
  if (!title) throw new Error('Inserisci un nome per il sito.');
  if (title.length > MAX_TITLE_LENGTH) throw new Error('Il nome non può superare 80 caratteri.');
  return title;
}

export function normalizeHttpUrl(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) throw new Error('Inserisci un indirizzo HTTP o HTTPS valido.');
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed;
  try { parsed = new URL(candidate); } catch { throw new Error('Inserisci un indirizzo HTTP o HTTPS valido.'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('Inserisci un indirizzo HTTP o HTTPS valido.');
  return parsed.href;
}

export function validateImageFile(file) {
  if (!file || !IMAGE_TYPES.includes(file.type)) throw new Error('Seleziona un’immagine PNG, JPEG o WebP.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('L’immagine non può superare 2 MB.');
  return file;
}

export function isValidSiteRecord(site) {
  try {
    validateTitle(site.title);
    normalizeHttpUrl(site.url);
    return typeof site.id === 'string' && Number.isInteger(site.position) && site.position >= 0 &&
      site.icon && ['auto', 'custom'].includes(site.icon.mode) &&
      (site.icon.mode === 'auto' ? site.icon.customDataUrl === null : typeof site.icon.customDataUrl === 'string') &&
      !Number.isNaN(Date.parse(site.createdAt)) && !Number.isNaN(Date.parse(site.updatedAt));
  } catch { return false; }
}

export function normalizePositions(sites) { return sites.map((site, index) => ({ ...site, position: index })); }

export function createSiteRecord({ title, url, iconMode = 'auto', customDataUrl = null, now = new Date(), id = crypto.randomUUID() }) {
  const timestamp = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  return { id, title: validateTitle(title), url: normalizeHttpUrl(url), position: 0, icon: { mode: iconMode, customDataUrl: iconMode === 'custom' ? customDataUrl : null }, createdAt: timestamp, updatedAt: timestamp };
}

export function updateSiteRecord(site, { title, url, iconMode, customDataUrl = null, now = new Date() }) {
  return { ...site, title: validateTitle(title), url: normalizeHttpUrl(url), icon: { mode: iconMode, customDataUrl: iconMode === 'custom' ? customDataUrl : null }, updatedAt: now instanceof Date ? now.toISOString() : new Date(now).toISOString() };
}
