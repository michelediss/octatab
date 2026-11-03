export function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function escapeForLabel(value) {
  return String(value).trim();
}

export function getHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

export function formatSiteCount(count) {
  if (count === 0) return '0 destinazioni salvate';
  if (count === 1) return '1 destinazione salvata';
  return `${count} destinazioni salvate`;
}

export function calculateTopSitesVerticalShift(rowCount, rowPitch) {
  if (!Number.isFinite(rowCount) || rowCount < 1 || !Number.isFinite(rowPitch)) return 0;
  if (rowCount === 1) return -rowPitch * 0.32;
  if (rowCount === 2) return -rowPitch * 0.16;
  return 0;
}

export function announce(element, message, timeout = 3200) {
  element.textContent = message;
  if (timeout) window.setTimeout(() => { if (element.textContent === message) element.textContent = ''; }, timeout);
}
