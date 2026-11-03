import { getHostname } from './utils.js';

export function createFaviconUrl(pageUrl, size = 64) {
  const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
  faviconUrl.searchParams.set('pageUrl', pageUrl);
  faviconUrl.searchParams.set('size', String(size));
  return faviconUrl.toString();
}

export function getFaviconRequestSize(cssSize, devicePixelRatio = globalThis.window?.devicePixelRatio ?? 1) {
  const safeCssSize = Number.isFinite(cssSize) ? cssSize : 40;
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(128, Math.max(16, Math.round(safeCssSize * safeDpr)));
}

export function getInitial(site) {
  const source = String(site.title || getHostname(site.url) || '?').trim();
  const meaningful = [...source].find((character) => /[\p{L}\p{N}]/u.test(character));
  return (meaningful || '?').toUpperCase();
}

export function hashHostname(url) {
  const hostname = getHostname(url);
  let hash = 0;
  for (const character of hostname) hash = ((hash << 5) - hash) + character.charCodeAt(0) | 0;
  return Math.abs(hash);
}

export function fallbackColor(url) { return `hsl(${hashHostname(url) % 360} 62% 42%)`; }

export function createGeneratedIcon(site) {
  const wrapper = document.createElement('span');
  wrapper.className = 'generated-icon';
  wrapper.textContent = getInitial(site);
  wrapper.style.setProperty('--fallback-color', fallbackColor(site.url));
  wrapper.setAttribute('aria-hidden', 'true');
  return wrapper;
}

export function applyIcon(container, site, cssIconSize = 40) {
  container.replaceChildren();
  if (site.icon.mode === 'custom' && site.icon.customDataUrl) {
    const image = document.createElement('img');
    image.className = 'site-icon-image site-icon-image--custom';
    image.alt = '';
    image.src = site.icon.customDataUrl;
    image.addEventListener('error', () => container.replaceChildren(createGeneratedIcon(site)), { once: true });
    container.append(image);
    return;
  }
  const image = document.createElement('img');
  image.className = 'site-icon-image site-icon-image--auto';
  image.alt = '';
  image.style.setProperty('--favicon-display-size', `${cssIconSize}px`);
  image.src = createFaviconUrl(site.url, getFaviconRequestSize(cssIconSize));
  image.addEventListener('load', () => {
    const intrinsicSize = Math.min(image.naturalWidth, image.naturalHeight);
    if (!intrinsicSize) return;
    const dpr = globalThis.window?.devicePixelRatio || 1;
    const displaySize = Math.min(cssIconSize, Math.max(16, intrinsicSize / dpr));
    image.style.setProperty('--favicon-display-size', `${displaySize}px`);
  }, { once: true });
  image.addEventListener('error', () => container.replaceChildren(createGeneratedIcon(site)), { once: true });
  container.append(image);
}

export async function processImageFile(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Impossibile leggere l’immagine.'));
      element.src = imageUrl;
    });
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const context = canvas.getContext('2d');
    const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.clearRect(0, 0, size, size);
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
    return canvas.toDataURL('image/webp', 0.88);
  } finally { URL.revokeObjectURL(imageUrl); }
}
