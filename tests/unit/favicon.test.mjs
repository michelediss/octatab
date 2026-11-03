import test from 'node:test';
import assert from 'node:assert/strict';
import { createFaviconUrl, fallbackColor, getFaviconRequestSize, getInitial, hashHostname } from '../../js/favicon.js';

globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://test${path}` } };

test('creates Chromium favicon endpoint URLs', () => {
  const url = new URL(createFaviconUrl('https://example.com/', 64));
  assert.equal(url.pathname, '/_favicon/');
  assert.equal(url.searchParams.get('pageUrl'), 'https://example.com/');
  assert.equal(url.searchParams.get('size'), '64');
});

test('requests favicon pixels according to display density, capped at 128px', () => {
  assert.equal(getFaviconRequestSize(40, 1), 40);
  assert.equal(getFaviconRequestSize(40, 2), 80);
  assert.equal(getFaviconRequestSize(80, 2), 128);
});

test('fallback initial and color are deterministic', () => {
  const site = { title: 'GitHub', url: 'https://github.com/' };
  assert.equal(getInitial(site), 'G');
  assert.equal(hashHostname(site.url), hashHostname(site.url));
  assert.equal(fallbackColor(site.url), fallbackColor(site.url));
});
