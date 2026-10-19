Passly Styleguide 6.1.1 includes fixes for QuickAccess password generator null-safety and generator settings initialization.

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