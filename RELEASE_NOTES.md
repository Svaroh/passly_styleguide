Passly Styleguide 6.1.0 introduces perpetual offline mode support, biometric passphrase authentication, recoverable trash operations, seamless offline routing, Passkey entity handling, and Passly branding.

## Highlights

- **Perpetual Offline Mode**: Support for unlimited session duration, unlimited data retention, and unlimited offline item cache with automatic fallback when the server is unreachable.
- **Biometric Unlock**: Updated InputPassphrase dialog with user profile header and biometric fingerprint / Touch ID authentication.
- **Recoverable Trash & Restore**: Soft deletion and restoration workflows in workspace menus and contextual menus with localized confirmations.
- **Seamless Offline Routing**: Instant offline readiness in QuickAccess and automatic routing to offline login or home without blocking on network requests.
- **Passkey Support**: Full support for Passkey secret entities (v5) across vault dialogs and icons.
- **Passly Branding & Localization**: Rebranded UI elements, logos, icons, and completed Ukrainian localization for offline mode and trash operations.

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