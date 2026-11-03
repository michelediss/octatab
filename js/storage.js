import { isValidSiteRecord, normalizePositions } from './validation.js';

export const STORAGE_KEY = 'topSitesData';
export const SCHEMA_VERSION = 1;

export class UnsupportedSchemaError extends Error {}
export class InvalidStorageError extends Error {}

export function emptyData() { return { schemaVersion: SCHEMA_VERSION, topSites: [] }; }

export function migrateData(data) {
  if (!data || typeof data !== 'object') return emptyData();
  if (data.schemaVersion !== SCHEMA_VERSION) throw new UnsupportedSchemaError('Versione dati non supportata.');
  if (!Array.isArray(data.topSites)) throw new InvalidStorageError('Dati dei siti non validi.');
  const sites = data.topSites.filter(isValidSiteRecord).sort((a, b) => a.position - b.position);
  return { schemaVersion: SCHEMA_VERSION, topSites: normalizePositions(sites) };
}

async function readRaw() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY];
}

export async function loadData() {
  const raw = await readRaw();
  const data = migrateData(raw);
  if (!raw) await chrome.storage.local.set({ [STORAGE_KEY]: data });
  return data;
}

export async function saveData(data) {
  const safeData = migrateData(data);
  await chrome.storage.local.set({ [STORAGE_KEY]: safeData });
  return safeData;
}

export async function addSite(record) {
  const latest = await loadData();
  const next = { ...record, position: latest.topSites.length };
  return saveData({ ...latest, topSites: [...latest.topSites, next] });
}

export async function updateSite(id, updater) {
  const latest = await loadData();
  const index = latest.topSites.findIndex((site) => site.id === id);
  if (index < 0) throw new Error('Il sito non è più disponibile.');
  const sites = latest.topSites.slice();
  sites[index] = updater(sites[index]);
  return saveData({ ...latest, topSites: normalizePositions(sites) });
}

export async function removeSite(id) {
  const latest = await loadData();
  return saveData({ ...latest, topSites: normalizePositions(latest.topSites.filter((site) => site.id !== id)) });
}

export function reorderSiteList(sites, id, destinationIndex) {
  const sourceIndex = sites.findIndex((site) => site.id === id);
  if (sourceIndex < 0) throw new Error('Il sito non è più disponibile.');
  if (!Number.isInteger(destinationIndex)) throw new Error('Posizione non valida.');
  const next = sites.slice();
  const [site] = next.splice(sourceIndex, 1);
  next.splice(Math.max(0, Math.min(destinationIndex, next.length)), 0, site);
  return normalizePositions(next);
}

export async function reorderSite(id, destinationIndex) {
  const latest = await loadData();
  return saveData({ ...latest, topSites: reorderSiteList(latest.topSites, id, destinationIndex) });
}
