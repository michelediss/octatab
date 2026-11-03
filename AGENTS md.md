# AGENTS.md

## Project overview

This repository contains a Brave/Chromium Manifest V3 extension that replaces the browser New Tab page with a user-managed grid of custom Top Sites.

The extension must:

* display Top Sites in rows of 8 on desktop;
* let the user add, edit, and remove sites;
* retrieve site icons automatically through the Chromium favicon API;
* allow automatic icons to be replaced with manually uploaded images;
* persist data using `chrome.storage.local`;
* work without a backend, local server, cloud service, or third-party favicon provider;
* remain lightweight, private, and maintainable.

The working product name may be changed later. Use `Custom Top Sites` as the temporary extension name unless another name is already configured in the repository.

---

## Primary goals

Implement a stable MVP with the following capabilities:

1. Replace the Brave New Tab page.
2. Show manually selected sites in a responsive grid.
3. Use exactly 8 columns on sufficiently wide desktop viewports.
4. Add new sites through an accessible modal dialog.
5. Edit existing sites.
6. Remove sites after explicit confirmation.
7. Load automatic favicons through the extension favicon API.
8. Allow users to upload custom icons.
9. Fall back to a generated initial when no icon is available.
10. Persist all configuration in `chrome.storage.local`.
11. Synchronize changes across multiple open New Tab pages.
12. Avoid unnecessary permissions and external requests.

---

## Non-goals for the MVP

Do not implement the following unless explicitly requested:

* drag-and-drop ordering;
* folders or categories;
* bookmarks integration;
* browsing history integration;
* automatic import of frequently visited sites;
* Chrome or Brave Sync;
* cloud storage;
* local backend;
* service worker;
* search engine widget;
* weather, clock, news, or other dashboard widgets;
* remote analytics;
* telemetry;
* external favicon services;
* HTML scraping of target websites;
* Web App Manifest icon discovery;
* global host permissions;
* remote JavaScript;
* CDN dependencies;
* user accounts;
* browser store publication workflow.

Keep the architecture extensible enough to support some of these features later.

---

## Technology constraints

Use:

* Manifest V3;
* HTML;
* CSS;
* modern vanilla JavaScript;
* `chrome.storage.local`;
* `chrome.storage.onChanged`;
* Chromium favicon API;
* native browser controls where practical;
* ES modules if they improve organization.

Do not use:

* React;
* Vue;
* Angular;
* Svelte;
* jQuery;
* backend frameworks;
* localStorage;
* IndexedDB unless explicitly approved;
* remote modules;
* runtime code downloads;
* `eval`;
* `new Function`;
* inline scripts;
* inline event handlers;
* external analytics;
* third-party favicon endpoints.

A small development-only test dependency is acceptable when it is clearly justified and does not ship into the extension runtime.

---

## Browser target

Primary target:

* Brave Desktop;
* Chromium extension platform;
* Linux desktop environment.

The extension should remain compatible with recent Chromium-based browsers where the required Manifest V3 APIs are supported.

Do not add Brave-specific APIs unless they are required.

---

## Required permissions

The manifest should request only:

```json
{
  "permissions": [
    "storage",
    "favicon"
  ]
}
```

Do not add any of the following without an explicit requirement:

```text
tabs
activeTab
history
bookmarks
topSites
downloads
scripting
contextMenus
unlimitedStorage
<all_urls>
```

Do not add `host_permissions` in the MVP.

Every new permission must be documented in the README with a concrete justification.

---

## Manifest requirements

The extension must override the New Tab page:

```json
{
  "manifest_version": 3,
  "name": "Custom Top Sites",
  "version": "1.0.0",
  "description": "A private and customizable New Tab page.",
  "permissions": [
    "storage",
    "favicon"
  ],
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },
  "icons": {
    "16": "assets/icons/extension-16.png",
    "32": "assets/icons/extension-32.png",
    "48": "assets/icons/extension-48.png",
    "128": "assets/icons/extension-128.png"
  }
}
```

Do not add a background service worker unless a future feature requires one.

---

## Suggested repository structure

Use this structure unless the repository already contains an equivalent organization:

```text
custom-top-sites/
├── manifest.json
├── newtab.html
├── css/
│   └── newtab.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── sites.js
│   ├── dialog.js
│   ├── favicon.js
│   ├── validation.js
│   └── utils.js
├── assets/
│   └── icons/
│       ├── extension-16.png
│       ├── extension-32.png
│       ├── extension-48.png
│       └── extension-128.png
├── tests/
│   └── unit/
└── README.md
```

Responsibilities should remain separated by module.

Avoid one large JavaScript file containing storage, rendering, validation, and dialog logic together.

---

## Module responsibilities

### `app.js`

Responsible for:

* application bootstrap;
* initial data loading;
* event registration;
* UI coordination;
* reacting to storage changes;
* error boundary for top-level failures.

### `storage.js`

Responsible for:

* reading extension data;
* writing extension data;
* initializing missing data;
* validating the storage container;
* migrating schema versions;
* adding, updating, and removing site records;
* handling concurrent changes safely.

No other module should call `chrome.storage.local` directly unless strongly justified.

### `sites.js`

Responsible for:

* rendering the grid;
* rendering individual site tiles;
* rendering the empty state;
* updating the visible site list;
* tile action menu behavior.

### `dialog.js`

Responsible for:

* add-site dialog;
* edit-site dialog;
* form reset;
* form population;
* focus management;
* custom icon preview;
* submit state;
* closing behavior.

### `favicon.js`

Responsible for:

* generating Chromium favicon URLs;
* rendering automatic icons;
* processing custom image uploads;
* generating fallback icons;
* handling icon loading failures.

### `validation.js`

Responsible for:

* title validation;
* URL normalization;
* URL protocol validation;
* uploaded image validation;
* storage record validation.

### `utils.js`

Responsible only for reusable helpers that do not naturally belong elsewhere.

Do not turn `utils.js` into a miscellaneous dumping ground.

---

## Data model

Store all application data under one storage key:

```text
topSitesData
```

Expected structure:

```json
{
  "schemaVersion": 1,
  "topSites": [
    {
      "id": "2bb0cc32-e918-4938-88c2-62d16a38fcb7",
      "title": "GitHub",
      "url": "https://github.com/",
      "position": 0,
      "icon": {
        "mode": "auto",
        "customDataUrl": null
      },
      "createdAt": "2026-07-24T10:00:00.000Z",
      "updatedAt": "2026-07-24T10:00:00.000Z"
    }
  ]
}
```

### Site record rules

#### `id`

* required;
* string;
* generated with `crypto.randomUUID()`;
* immutable after creation.

#### `title`

* required;
* string;
* trimmed;
* minimum length: 1;
* maximum length: 80.

#### `url`

* required;
* absolute URL;
* only `http:` and `https:` are allowed;
* normalized before storage.

#### `position`

* required;
* integer;
* zero-based;
* should match visual ordering.

For the MVP, array order may be treated as the source of truth, but `position` must remain consistent.

#### `icon.mode`

Allowed values:

```text
auto
custom
```

#### `icon.customDataUrl`

* `null` when mode is `auto`;
* valid locally generated image Data URL when mode is `custom`;
* remove or reset it when switching back to automatic mode.

#### `createdAt`

ISO 8601 timestamp set once during creation.

#### `updatedAt`

ISO 8601 timestamp updated after each edit.

---

## Schema migration

All stored data must contain:

```json
{
  "schemaVersion": 1
}
```

Implement a migration layer from the beginning.

Suggested interface:

```javascript
function migrateData(data) {
  switch (data.schemaVersion) {
    case 1:
      return data;
    default:
      throw new UnsupportedSchemaError();
  }
}
```

Rules:

* never silently overwrite data from an unknown future schema;
* initialize empty storage with schema version 1;
* keep migrations pure and testable;
* validate the result after migration.

---

## Storage behavior

Use promise-based Chromium storage APIs.

Example:

```javascript
const { topSitesData } = await chrome.storage.local.get("topSitesData");
```

```javascript
await chrome.storage.local.set({
  topSitesData: data
});
```

Required behavior:

* initialize missing data;
* recover gracefully from malformed records where possible;
* do not silently discard user data;
* display an error when a write fails;
* keep the edit dialog open after a failed save;
* prevent duplicate writes from repeated submit clicks;
* listen to `chrome.storage.onChanged`;
* update all open New Tab pages after a successful change.

When multiple tabs may update the same data:

1. reload the latest data;
2. apply the operation using the site ID;
3. save the updated container;
4. allow other tabs to refresh through `chrome.storage.onChanged`.

---

## New Tab behavior

On page load:

1. start the application;
2. read `topSitesData`;
3. initialize empty storage if needed;
4. validate and migrate data;
5. render the main layout;
6. render sites in stored order;
7. load icons without blocking tile rendering;
8. show the empty state when there are no sites.

The page must remain usable if one or more favicons fail.

Do not perform blocking synchronous work during startup.

Do not force focus away from the browser address bar when the New Tab page opens.

The document title must be:

```html
<title>Nuova scheda</title>
```

---

## Grid layout

The desktop layout must use exactly 8 columns on sufficiently wide viewports.

Base rule:

```css
.sites-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: var(--grid-gap);
}
```

Expected row behavior:

```text
1–8 sites    → 1 row
9–16 sites   → 2 rows
17–24 sites  → 3 rows
25–32 sites  → 4 rows
```

Suggested responsive breakpoints:

```text
≥ 1280 px     8 columns
1024–1279 px  6 columns
768–1023 px   4 columns
480–767 px    3 columns
< 480 px      2 columns
```

Requirements:

* centered grid;
* configurable maximum width;
* no horizontal scrollbar;
* vertical scrolling when needed;
* uniform tile dimensions;
* stable spacing;
* DOM order equal to stored order.

Do not use `auto-fill` or `auto-fit` for the main desktop rule if doing so can produce a number of columns other than 8.

---

## Site tile requirements

Each tile must contain:

* icon;
* site title;
* real anchor link;
* action menu;
* accessible name.

Recommended structure:

```html
<article class="site-tile">
  <a class="site-link" href="https://example.com/">
    <span class="site-icon"></span>
    <span class="site-title">Example</span>
  </a>

  <button
    class="site-menu-button"
    type="button"
    aria-label="Azioni per Example"
  ></button>
</article>
```

The anchor must remain a real `<a>` element so native browser behaviors work:

* normal click opens in the current tab;
* middle-click opens in a new tab;
* Ctrl-click opens in a new tab;
* context menu remains available;
* link address can be copied.

Do not replace anchor behavior with `window.location` unless required for a specific fallback.

---

## Tile action menu

Each tile should expose a compact action menu, preferably through a three-dot button.

Required actions:

```text
Modifica
Rimuovi
```

The menu must:

* work with mouse and keyboard;
* close on Escape;
* close when focus moves outside where appropriate;
* expose correct ARIA state;
* not trigger the underlying site link;
* be reachable through visible focus navigation.

---

## Add site flow

The main page must include:

```text
+ Aggiungi sito
```

Clicking it opens an accessible modal dialog.

Required fields:

1. site name;
2. site URL;
3. icon mode;
4. custom icon file input when custom mode is selected.

Default icon mode:

```text
auto
```

### Add sequence

1. Open dialog.
2. Reset old values.
3. Focus the first field.
4. User enters title and URL.
5. User optionally selects a custom icon.
6. Validate inputs.
7. Normalize URL.
8. Process uploaded image if present.
9. Generate UUID.
10. Append record to the site array.
11. Assign the next position.
12. Save through the storage repository.
13. Render updated grid.
14. Close dialog only after successful persistence.
15. Return focus to the Add button.

---

## Edit site flow

The same dialog should be reused for add and edit operations.

When editing:

* preload the existing title;
* preload the existing URL;
* preload the icon mode;
* show the current icon preview;
* retain the same site ID;
* retain `createdAt`;
* update `updatedAt`.

If the URL changes while icon mode is automatic, the rendered favicon must use the new URL.

If the user selects automatic mode:

* set `icon.mode` to `auto`;
* set `customDataUrl` to `null`;
* render the Chromium favicon.

If the user selects custom mode:

* require a valid uploaded image unless an existing custom icon is already available;
* process and store the image;
* render it immediately after save.

---

## Remove site flow

Removing a site must require confirmation.

Suggested message:

```text
Rimuovere “GitHub” dai Top Sites?
```

Actions:

```text
Annulla
Rimuovi
```

After confirmation:

1. remove the record by ID;
2. normalize remaining positions;
3. save updated data;
4. refresh the grid;
5. remove associated custom icon data with the record;
6. close the confirmation UI.

Cancel must not change storage.

---

## URL rules

Accept only:

```text
http:
https:
```

Normalize values without a scheme by prepending:

```text
https://
```

Examples:

```text
github.com
→ https://github.com/
```

```text
www.github.com
→ https://www.github.com/
```

Reject:

```text
javascript:
data:
vbscript:
file:
chrome:
brave:
chrome-extension:
```

Use the built-in `URL` constructor after normalization.

Do not validate URLs using only regular expressions.

Example interface:

```javascript
function normalizeHttpUrl(value) {
  const trimmed = value.trim();
  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(candidate);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Unsupported URL protocol");
  }

  return url.href;
}
```

---

## Automatic favicon behavior

Use the Chromium extension favicon endpoint.

Required manifest permission:

```text
favicon
```

Generate favicon URLs using:

```javascript
function createFaviconUrl(pageUrl, size = 64) {
  const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));

  faviconUrl.searchParams.set("pageUrl", pageUrl);
  faviconUrl.searchParams.set("size", String(size));

  return faviconUrl.toString();
}
```

Rules:

* use the complete normalized site URL;
* request 64 px by default;
* optionally request 128 px for high-density displays;
* do not store automatic favicon image data;
* generate the URL during rendering;
* add an image error handler;
* replace failed images with a generated fallback;
* do not show broken image placeholders;
* do not block tile rendering while icons load.

Do not use:

* Google favicon service;
* DuckDuckGo favicon service;
* Clearbit;
* Icon Horse;
* root `/favicon.ico` fetching;
* target-site HTML parsing.

---

## Custom icon behavior

Supported source formats for the MVP:

```text
image/png
image/jpeg
image/webp
```

Do not accept SVG in the MVP.

Maximum source file size:

```text
2 MB
```

Uploaded images must be processed locally:

1. validate MIME type;
2. validate file size;
3. decode image;
4. draw it onto a square canvas;
5. preserve aspect ratio;
6. center the image;
7. resize to a maximum of 128×128 px;
8. export as WebP when supported;
9. otherwise export as PNG;
10. save the resulting Data URL.

Preferred final format:

```text
WebP, 128×128
```

Fallback final format:

```text
PNG, 128×128
```

The original uploaded file must not be stored unchanged.

Display an icon preview before saving.

When custom mode is removed, delete the stored custom Data URL.

---

## Generated fallback icon

When no usable icon is available, generate a local visual fallback.

The fallback should contain:

* first meaningful character from the title;
* otherwise first character from the hostname;
* deterministic background color derived from the hostname.

Example:

```text
GitHub → G
YouTube → Y
example.com → E
```

The generated icon:

* must not require network access;
* must not be stored as an image;
* must be stable across sessions;
* must have sufficient foreground/background contrast;
* must preserve the accessible site name separately.

Suggested API:

```javascript
function createGeneratedIcon(site) {
  return {
    letter: getInitial(site),
    hue: hashHostname(site.url) % 360
  };
}
```

---

## Dialog requirements

Use the native `<dialog>` element unless a compatibility issue requires a custom accessible modal.

Required dialog titles:

```text
Aggiungi sito
Modifica sito
```

Suggested fields:

```text
Nome
URL
Icona automatica
Icona personalizzata
Seleziona immagine
Anteprima
Annulla
Salva
```

Behavior:

* Escape closes the dialog;
* focus is trapped while open;
* focus returns to the opener after close;
* submitting twice is prevented;
* Save is disabled during persistence;
* failed persistence keeps the dialog open;
* field errors appear next to the relevant field;
* clicking the backdrop should not discard unsaved changes accidentally.

---

## Empty state

When no sites exist, show:

```text
Nessun sito configurato.

Aggiungi il primo sito alla tua pagina Nuova scheda.
```

Include an Add Site action in the empty state.

Do not display an empty grid with no explanation.

---

## Feedback and errors

Required field errors:

### Empty title

```text
Inserisci un nome per il sito.
```

### Invalid URL

```text
Inserisci un indirizzo HTTP o HTTPS valido.
```

### Unsupported image

```text
Seleziona un’immagine PNG, JPEG o WebP.
```

### Oversized image

```text
L’immagine non può superare 2 MB.
```

### Storage failure

```text
Non è stato possibile salvare le modifiche.
```

Favicon failure should be handled silently through the generated fallback.

Use non-intrusive status messages or toast notifications for successful add, edit, and remove operations.

Do not use blocking `alert()` calls for ordinary application feedback.

A native confirmation dialog may be used temporarily during early development, but the final MVP should preferably use an accessible application dialog.

---

## Accessibility requirements

The entire extension must be usable without a mouse.

Requirements:

* semantic HTML;
* real buttons;
* real links;
* visible focus styles;
* keyboard-operable menus;
* associated form labels;
* logical tab order;
* Escape support;
* focus restoration;
* sufficient contrast;
* no hover-only actions;
* `aria-label` for icon-only controls;
* accessible error messages;
* dialog semantics;
* no focus theft during New Tab startup.

Icons that are decorative should use:

```html
alt=""
```

The anchor accessible name should include the site title.

Example:

```html
<a
  href="https://github.com/"
  aria-label="Apri GitHub"
>
```

---

## Visual requirements

The design should be:

* minimal;
* neutral;
* fast;
* desktop-oriented;
* consistent in light and dark themes;
* free of visual clutter.

Support the system theme using:

```css
@media (prefers-color-scheme: dark) {
}
```

Suggested variables:

```css
:root {
  --page-max-width: 1440px;
  --grid-gap: 18px;
  --tile-radius: 16px;
  --tile-icon-size: 48px;
  --transition-duration: 140ms;
}
```

Tile titles may be visually truncated, but the full title must remain accessible through an attribute or assistive text.

Avoid excessive motion.

Respect:

```css
@media (prefers-reduced-motion: reduce) {
}
```

---

## Performance requirements

The New Tab page must feel immediate.

Requirements:

* no external network calls;
* one primary storage read on startup;
* no framework bundle;
* no service worker startup;
* no synchronous heavy processing;
* no image conversion during normal rendering;
* favicon loading must not block content;
* support at least 100 sites without noticeable degradation;
* update only the necessary DOM when practical.

Avoid premature complexity, but do not rebuild the entire application architecture around individual DOM mutations.

---

## Privacy requirements

The extension must not:

* send configured URLs to third-party services;
* collect analytics;
* collect telemetry;
* contact a backend;
* embed trackers;
* load remote assets;
* inspect browsing history;
* inspect open tabs;
* inspect bookmarks.

All user data must remain inside `chrome.storage.local`.

The README must state that extension data is removed when the extension or browser profile is deleted.

---

## Security requirements

Never inject user content with `innerHTML`.

Use:

```javascript
element.textContent = value;
```

Do not execute or interpret user-entered values.

Do not use:

* `eval`;
* `new Function`;
* inline JavaScript;
* untrusted HTML;
* remote scripts;
* remote CSS.

Validate all stored data before rendering, even when it originated from the extension itself.

Treat imported or manually modified extension data as untrusted if import functionality is introduced later.

Uploaded images must be decoded and re-encoded before storage.

---

## Concurrent tab behavior

Multiple New Tab pages may be open at the same time.

Register:

```javascript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (!changes.topSitesData) {
    return;
  }

  refreshFromStorage();
});
```

Requirements:

* changes in one New Tab page appear in another;
* avoid infinite save/render loops;
* ignore unrelated storage changes;
* handle a deleted record while an edit dialog is open;
* show a clear message if an edited record no longer exists.

---

## Coding standards

Use:

* clear function names;
* small focused functions;
* `const` by default;
* `let` only when reassignment is necessary;
* async/await;
* explicit error handling;
* JSDoc for public module functions where useful;
* pure functions for validation and transformations;
* early returns;
* strict comparisons;
* predictable data flow.

Avoid:

* deep nesting;
* hidden global state;
* duplicated validation;
* direct storage access across multiple UI modules;
* side effects in utility functions;
* generic catch blocks that silently ignore errors;
* unnecessary classes;
* premature abstractions.

Use `"use strict"` only if scripts are not ES modules. ES modules are strict by default.

---

## Testing requirements

### Unit tests

Cover at least:

* URL normalization;
* protocol rejection;
* title validation;
* image MIME validation;
* image size validation;
* favicon URL generation;
* deterministic fallback color;
* fallback initial selection;
* schema migration;
* add-site transformation;
* update-site transformation;
* remove-site transformation;
* position normalization.

### Integration tests

Cover:

* initial storage load;
* empty storage initialization;
* storage write;
* rendering 8 tiles in the first desktop row;
* rendering the ninth tile in the second row;
* dialog open and close;
* successful add;
* successful edit;
* successful remove;
* custom icon selection;
* automatic icon restoration;
* favicon error fallback;
* storage update from another tab.

### Manual Brave test checklist

Verify:

1. unpacked installation through `brave://extensions`;
2. New Tab override;
3. exactly 8 columns on wide desktop;
4. responsive layout;
5. persistence after Brave restart;
6. add site;
7. edit site;
8. remove site;
9. remove cancellation;
10. automatic favicon for a known site;
11. fallback for an unavailable favicon;
12. PNG custom icon;
13. JPEG custom icon;
14. WebP custom icon;
15. oversized file rejection;
16. unsupported file rejection;
17. light theme;
18. dark theme;
19. keyboard-only navigation;
20. two open New Tab pages updating together;
21. no remote requests in browser developer tools;
22. no ordinary console errors.

---

## Acceptance criteria

### AC-01 — New Tab override

Given the extension is installed and enabled, when a new tab is opened, `newtab.html` is displayed.

### AC-02 — Eight-column desktop grid

Given a sufficiently wide desktop viewport and at least eight sites, the first row contains exactly eight tiles.

### AC-03 — Ninth item placement

Given nine sites, the ninth site appears as the first item in the second row.

### AC-04 — Stored ordering

Given an ordered array in storage, rendered tile order matches stored order.

### AC-05 — Add site

Given valid title and URL values, saving adds a site to storage and renders it at the end of the grid.

### AC-06 — URL normalization

Given `example.com`, saving stores `https://example.com/`.

### AC-07 — Unsafe protocol rejection

Given a `javascript:` URL, saving is blocked.

### AC-08 — Automatic favicon

Given a site with `icon.mode = "auto"`, its icon source uses the Chromium extension favicon endpoint.

### AC-09 — Favicon fallback

Given a favicon loading failure, a generated fallback appears without displaying a broken image.

### AC-10 — Custom icon

Given a valid uploaded image, it is processed, stored, and displayed.

### AC-11 — Restore automatic icon

Given a site using a custom icon, switching to automatic mode removes custom icon data and restores the browser favicon.

### AC-12 — Edit site

Editing a site preserves its ID and creation timestamp while updating its modified timestamp.

### AC-13 — Cancel removal

Cancelling removal leaves storage unchanged.

### AC-14 — Confirm removal

Confirming removal deletes the record and refreshes the grid.

### AC-15 — Persistence

Saved sites remain available after closing and reopening Brave.

### AC-16 — Cross-tab refresh

A change made in one New Tab page appears in another open New Tab page.

### AC-17 — No external favicon traffic

Opening the New Tab page causes no request to third-party favicon providers.

### AC-18 — Permission scope

The extension requests only `storage` and `favicon`.

---

## Definition of done

The MVP is complete only when:

* the extension loads successfully as an unpacked extension;
* the manifest contains no unnecessary permissions;
* New Tab override works in Brave;
* desktop layout shows 8 columns;
* add, edit, and remove flows work;
* site data persists in `chrome.storage.local`;
* automatic favicons use the Chromium favicon API;
* custom icons can be uploaded and removed;
* missing favicons use generated fallbacks;
* multiple New Tab pages stay synchronized;
* no backend is required;
* no third-party service is contacted;
* no normal workflow produces console errors;
* automated tests cover pure business logic;
* README installation steps are complete;
* manual Brave test checklist is included.

---

## Required README content

The README must include:

1. project description;
2. feature list;
3. repository structure;
4. permissions and their justification;
5. installation steps for Brave;
6. development workflow;
7. test commands;
8. manual test checklist;
9. data storage explanation;
10. privacy statement;
11. known limitations;
12. uninstall warning.

Installation steps must include:

```text
1. Open brave://extensions
2. Enable Developer mode
3. Select Load unpacked
4. Choose the extension directory
5. Open a new tab
```

Explain that removing the extension or deleting the Brave profile removes the data stored in `chrome.storage.local`.

---

## Expected Codex output

When implementing the project, produce:

* complete source files;
* valid `manifest.json`;
* modular JavaScript;
* accessible HTML;
* responsive CSS;
* extension icons or clearly marked placeholders;
* unit tests;
* README;
* installation instructions;
* permission explanation;
* manual test checklist;
* concise summary of implementation decisions.

Do not return only isolated snippets when asked to implement the repository.

Create or modify the actual project files.

---

## Implementation order

Follow this sequence:

1. Create the manifest and New Tab override.
2. Create the base HTML layout.
3. Implement storage schema and repository.
4. Implement site validation.
5. Implement 8-column grid rendering.
6. Implement automatic favicon rendering.
7. Implement generated fallback icons.
8. Implement Add Site dialog.
9. Implement Edit Site flow.
10. Implement Remove Site flow.
11. Implement custom icon processing.
12. Add storage change synchronization.
13. Add accessibility refinements.
14. Add responsive and theme styling.
15. Add tests.
16. Complete README.
17. Run the full manual checklist.

Do not begin with optional future features.

---

## Future extension points

The architecture should make it possible to later add:

* drag-and-drop reordering;
* JSON import and export;
* automatic backups;
* categories;
* folders;
* custom tile sizes;
* keyboard shortcuts;
* selectable themes;
* custom backgrounds;
* context menu integration;
* optional sync;
* local search.

Do not implement these features now.

Avoid design decisions that would make them unnecessarily difficult later.

