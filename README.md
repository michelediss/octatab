# OctaTab

OctaTab is a private, lightweight Brave/Chromium New Tab extension. It replaces the default page with a clean, responsive grid of sites you choose.

## Highlights

- Eight-column desktop grid with responsive breakpoints.
- Add, edit, remove, reorder, and drag-and-drop sites.
- Automatic Chromium favicons or local custom icons.
- Local-only storage via `chrome.storage.local`.
- Light and dark system themes, keyboard support, visible focus, and reduced-motion support.

## Privacy

OctaTab has no backend, account, analytics, trackers, remote assets, or host permissions. Data stays in the browser profile. The only requested permissions are `storage` and `favicon`.

## Install in Brave

1. Open `brave://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this project directory.
5. Open a new tab.

## Development

No build step or dependencies are required. After making changes, reload the extension from `brave://extensions`.

Run the test suite with:

```bash
node --test tests/unit/*.test.mjs tests/integration/*.test.mjs
```

## License

All rights reserved unless a license is added to this repository.
