import test from 'node:test';
import assert from 'node:assert/strict';
import { addSite, loadData, removeSite, updateSite } from '../../js/storage.js';
import { createSiteRecord } from '../../js/validation.js';

let stored;
globalThis.chrome = {
  storage: {
    local: {
      async get() { return stored ? { topSitesData: structuredClone(stored) } : {}; },
      async set(value) { stored = structuredClone(value.topSitesData); }
    }
  }
};

test('storage repository initializes, writes, updates, and removes records', async () => {
  stored = undefined;
  const initial = await loadData();
  assert.deepEqual(initial.topSites, []);
  const record = createSiteRecord({ title: 'Example', url: 'example.com', id: 'integration-site' });
  await addSite(record);
  assert.equal((await loadData()).topSites[0].url, 'https://example.com/');
  await updateSite(record.id, (site) => ({ ...site, title: 'Updated' }));
  assert.equal((await loadData()).topSites[0].title, 'Updated');
  await removeSite(record.id);
  assert.deepEqual((await loadData()).topSites, []);
});
