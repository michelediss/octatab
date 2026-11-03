# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Brave Desktop users who want a small, private set of hand-picked destinations available immediately in every new tab.

## Product Purpose

Custom Top Sites replaces the default new-tab surface with a user-managed grid of links. Success means opening a saved destination quickly, while adding and maintaining sites stays simple and predictable.

## Positioning

The product is deliberately manual and local: it gives users control over a focused launchpad without inspecting history, bookmarks, open tabs, or sending URLs to a service.

## Operating Context

Used repeatedly in a desktop browser new tab, with mouse, keyboard, and occasional touch input. The page must be useful in both bright and dim system themes.

## Capabilities and Constraints

Manifest V3 extension. Supports add, edit, remove, automatic Chromium favicon icons, locally processed custom icons, generated fallbacks, local persistence, and cross-tab storage updates. No backend, remote assets, analytics, service worker, or permissions beyond `storage` and `favicon`.

## Brand Commitments

Temporary product name: Custom Top Sites. Interface language is Italian as specified by the brief.

## Evidence on Hand

The product brief in `AGENTS md.md` is the source of truth. No existing visual assets or customer evidence are present; the UI must not invent commercial claims.

## Product Principles

- Open a known destination with one clear action.
- Keep the user's data local and the implementation lightweight.
- Make maintenance safe: validate, confirm destructive actions, and preserve edits on failure.
- Treat keyboard access, theme support, and responsive behavior as core functionality.

## Accessibility & Inclusion

Use semantic HTML, visible focus, keyboard-operable menus and dialogs, associated errors, sufficient contrast, reduced-motion support, and touch-sized controls.
