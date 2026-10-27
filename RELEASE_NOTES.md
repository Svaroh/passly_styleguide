Passly Styleguide 6.1.5 fixes table layout and container stretching preventing white gaps, with responsive resize handling.

## [6.1.5] - 2026-10-27

### Fixed
- Ensure table header and body expand to 100% minimum container width in `TableHead` and `TableBody` to eliminate white space gap
- Add responsive window resize listener in `TableContextProvider` for dynamic column and table width recomputation
- Maintain styling consistency and dark theme integrity across offline reloads

## [6.1.4] - 2026-10-27

### Fixed
- Prevent page turning blank after offline reload by maintaining loggedInUser state on RBAC and network failures in `ExtAppContext`
- Add resilient fallbacks for `getUserSettings`, `initLocale`, and `getLoggedInUser`
- Add `ExtAppErrorBoundary` to prevent unmounting entire application tree on unhandled component errors
- Add wildcard fallback route in `ExtBootstrapApp` to keep `InsertAppIframe` mounted on arbitrary subroutes

## [6.1.3] - 2026-10-25

### Fixed
- Add defensive null and type checks for `canIUse` in `ExtQuickAccessContext` and `ExtAppContext`
- Ensure error suppression and logger robustness during offline execution

## [6.1.2] - 2026-10-25

### Fixed
- Add offline fallback and error suppression for `getSiteSettings` and `getLoggedInUser` in `ExtAppContext`
- Prevent `TypeError: Cannot read properties of null (reading 'canIUse')` when server is unreachable
- Ensure seamless offline workspace initialization when network is disconnected

## [6.1.1] - 2026-10-19

### Fixed
- Fix TypeError: Cannot read properties of null (reading 'default_generator') in QuickAccess
- Provide default generator fallback settings and null guards in PrepareResourceContext, SecretGenerator, and GeneratePasswordPage

## [6.1.0] - 2026-10-15

### Added
- Add perpetual offline mode settings with unlimited session duration, retention, and items
- Add biometric authentication (fingerprint / Touch ID) and user profile header to InputPassphrase dialog
- Add recoverable resource trash and restore actions in workspace and contextual menus
- Add support for Passkey secrets (v5 passkey entity model, schema, and icons)
- Add GitHub Actions CI and CodeQL workflows
- Add full Ukrainian localization for offline mode, connection errors, and trash operations

### Changed
- Rebrand styleguide assets, logos, and UI components to Passly
- Make QuickAccess ready immediately for offline sessions without waiting for server connection
- Seamlessly route to home or offline login without blocking on unreachable server
- Update InputPassphrase submit button and validation handling

### Fixed
- Fix edit resource action from URL query to use permission workflow via handleEditClickEvent
- Fix active session null-guards in QuickAccess contexts and routing
- Fix ESLint and Prettier formatting across QuickAccess and ActiveSession contexts
- Fix workspace filters dropdown and test expectations after removal of redundant offline filter item

# v5.16.1

Provides:
- Help section for Offline Mode settings
- QuickAccess blank page on SSO login issue fix
- Metadata key rotation creator name display issue fix