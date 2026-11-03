import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteRecord, normalizeHttpUrl, normalizePositions, updateSiteRecord, validateImageFile, validateTitle } from '../../js/validation.js';

test('normalizes URLs and only accepts HTTP protocols', () => {
  assert.equal(normalizeHttpUrl('github.com'), 'https://github.com/');
  assert.equal(normalizeHttpUrl('https://example.com/path'), 'https://example.com/path');
  assert.throws(() => normalizeHttpUrl('javascript:alert(1)'));
  assert.throws(() => normalizeHttpUrl('file:///tmp/file'));
});

test('validates title length and required content', () => {
  assert.equal(validateTitle('  GitHub  '), 'GitHub');
  assert.throws(() => validateTitle(''));
  assert.throws(() => validateTitle('x'.repeat(81)));
});

test('validates image MIME type and size', () => {
  assert.doesNotThrow(() => validateImageFile({ type: 'image/png', size: 100 }));
  assert.throws(() => validateImageFile({ type: 'image/svg+xml', size: 100 }));
  assert.throws(() => validateImageFile({ type: 'image/png', size: 2 * 1024 * 1024 + 1 }));
});

test('creates and updates site records without changing identity', () => {
  const created = createSiteRecord({ title: 'Example', url: 'example.com', now: new Date('2026-01-01T00:00:00Z'), id: 'site-1' });
  const updated = updateSiteRecord(created, { title: 'Updated', url: 'https://example.org', iconMode: 'auto', now: new Date('2026-01-02T00:00:00Z') });
  assert.equal(created.id, 'site-1');
  assert.equal(created.url, 'https://example.com/');
  assert.equal(updated.createdAt, created.createdAt);
  assert.equal(updated.updatedAt, '2026-01-02T00:00:00.000Z');
  assert.equal(updated.icon.customDataUrl, null);
});

test('normalizes positions', () => {
  const sites = [{ position: 4 }, { position: 9 }];
  assert.deepEqual(normalizePositions(sites).map((site) => site.position), [0, 1]);
});
