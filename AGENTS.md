# Passly Styleguide Notes

This repository is a local checkout of the `Svaroh/passly_styleguide` fork,
providing shared UI design tokens, React components, and styling assets across
Passly client applications (primarily the browser extension).

## Repository Context

- Stack: React 18, LESS, Storybook 10, Webpack 5, Jest, ESLint 9, and Playwright
  test-runner.
- Main source areas:
  - `src/react-extension/`: React components for extension workspace, dialogs,
    vault items, and forms.
  - `src/react-quickaccess/`: React components for the browser extension popup.
  - `src/less/`: LESS stylesheets, mixins, variables, and theme definitions.
  - `src/locales/`: Localization dictionaries.
  - `.storybook/`: Storybook configuration and component stories.
- Key capabilities:
  - Shared UI design tokens (typography, color palettes, theme variables).
  - Offline workspace states (vault rendering and feedback when disconnected).
  - Biometric unlock dialogs and authentication flows.
  - QR code rendering/scanning and TOTP authentication displays.

## Passly / Upstream Notes

- This repository is maintained as part of Passly (`Svaroh/passly_styleguide`).
- Keep historical upstream Passbolt notices in files derived from upstream code.
- For new files authored entirely for Passly, use the Passly/Svaroh copyright
  header: `@link https://passly.svaroh.net Passly`.
- Do not invent `PB-` / Passbolt issue IDs in commit messages or release notes.

## Common Commands

Run commands from `passly_styleguide/`:

```bash
npm ci
npm run lint
npm run build
npm run test:unit
npm run test:ci:coverage
npm run dev:storybook:build
npm run test:storybook
```

Additional targeted commands:

```bash
npm run lint:eslint
npm run lint:eslint-fix
npm run lint:lockfile
npm run test:coverage
npm run dev:storybook:start
npm run dev:storybook:install
npm run watch
```

## Editing & Testing Rules

- Run `git status --short` before making changes to preserve unrelated work.
- Do not run destructive git commands.
- When adding or modifying user-facing text, extract strings and update locale
  dictionaries (`npm run i18n:externalize`).
- Run `npm run lint` and `npm run test:unit` locally before committing.
- Avoid absolute filesystem paths; use relative paths within the repository.
