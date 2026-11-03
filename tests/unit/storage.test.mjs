import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, migrateData, reorderSiteList, UnsupportedSchemaError } from '../../js/storage.js';
import { createSiteRecord } from '../../js/validation.js';

test('initializes an empty versioned container', () => {
  assert.deepEqual(emptyData(), { schemaVersion: 1, topSites: [] });
  assert.deepEqual(migrateData(undefined), emptyData());
});

test('rejects future schemas without overwriting them', () => {
  assert.throws(() => migrateData({ schemaVersion: 99, topSites: [] }), UnsupportedSchemaError);
});

test('migrates valid records and repairs positions', () => {
  const a = createSiteRecord({ title: 'A', url: 'a.example', id: 'a', now: new Date('2026-01-01') });
  const b = createSiteRecord({ title: 'B', url: 'b.example', id: 'b', now: new Date('2026-01-01') });
  const data = migrateData({ schemaVersion: 1, topSites: [{ ...b, position: 8 }, { ...a, position: 2 }] });
  assert.deepEqual(data.topSites.map((site) => site.id), ['a', 'b']);
  assert.deepEqual(data.topSites.map((site) => site.position), [0, 1]);
});

test('reorders records and normalizes their positions', () => {
  const timestamp = new Date('2026-01-01');
  const sites = ['a', 'b', 'c'].map((id, position) => ({ ...createSiteRecord({ title: id, url: `${id}.example`, id, now: timestamp }), position }));
  const reordered = reorderSiteList(sites, 'a', 2);
  assert.deepEqual(reordered.map((site) => site.id), ['b', 'c', 'a']);
  assert.deepEqual(reordered.map((site) => site.position), [0, 1, 2]);
});
