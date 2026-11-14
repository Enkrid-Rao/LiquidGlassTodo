# Changelog

All notable changes to Tide are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-11-14

First public release. This build turns the prototype into something you can
download, run and report on.

### Added

- **Portable Windows builds.** `electron-builder` now produces a portable
  `.zip` and a single-file portable `.exe`; tagged releases are built and
  uploaded by a GitHub Actions workflow.
- **Version shown in the app.** The Customize footer reads the real build
  version from `package.json` instead of a hard-coded `v1.1`.
- **Filter shortcuts everywhere.** `←` / `→` now switch Open / All / Done from
  anywhere outside a text field, as the shortcut list always promised.
- **Focus trap in the Customize sheet.** `Tab` / `Shift+Tab` cycle inside the
  open sheet instead of wandering into the window controls.
- **Clearer "All" status.** The list header reports the total task count
  instead of showing the open count while completed tasks are visible.
- **Clock refresh on return.** The date and clock are re-read when the widget
  regains focus or becomes visible again.

### Fixed

- **"Keep on top" now defaults to on**, as documented. The previous loader
  ignored the `DEFAULT_SETTINGS` object, so a fresh install started unpinned.
- **Corrupt settings no longer break startup.** A `null` or malformed
  `settings.json` is now treated as an empty file instead of throwing.
- **Hue sliders no longer snap.** Both hue controls now end at 359° to match
  the settings clamp, so dragging fully right no longer jumps back a degree.
- **Reduced-motion users keep window focus styling.** Blur/focus handling was
  moved out of the pointer-specular setup, which skipped it under
  `prefers-reduced-motion`.
- Minor cleanups: dead render path removed, task edit fields no longer spell
  check, and duplicate settings defaults consolidated.

### Changed

- The project is now MIT licensed.
- Documentation rewritten in English (`README.md`) with a Chinese companion
  (`README_zh.md`), badges, download instructions and build notes.

## [1.1.0] — 2026-11-12

Previous internal build, never published as a package.
- Customize sheet with four tabs: Theme, Color, Effects, App.
- Eight one-click presets: Lagoon, Aurora, Dusk, Ember, Frost, Iris, Moss, Ink.
- Eight atmosphere recipes with independent intensity, plus background hue,
  tint strength, accent hue and glass opacity.
- Halo, cursor light, grain, ambient drift, date line and 12/24-hour clock.
- Keep on top, start with Windows, reset window position and reset appearance.
- Task list with add, complete, edit, delete, undo, filters and clear completed.
- Window position persistence, single-instance lock and Windows login item.

[1.2.0]: https://github.com/Enkrid-Rao/LiquidGlassTodo/releases/tag/v1.2.0
