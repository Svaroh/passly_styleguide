/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withAppContext } from "../../../../shared/context/AppContext/AppContext";
import UserAbortsOperationError from "../../../lib/Error/UserAbortsOperationError";
import { Trans, withTranslation } from "react-i18next";
import Password from "../../../../shared/components/Password/Password";
import DialogWrapper from "../../Common/Dialog/DialogWrapper/DialogWrapper";
import Select from "../../Common/Select/Select";
import UserAvatar from "../../Common/Avatar/UserAvatar";
import FingerprintSVG from "../../../../img/svg/fingerprint.svg";

class InputPassphrase extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.initEventHandlers();
    this.createInputRef();
  }

  componentDidMount() {
    this.focusOnPassphrase();
    this.initDefaultRememberMeChoice();
    this.initBiometricAuth();
  }

  getDefaultState() {
    return {
      attempt: 0,
      processing: false,
      passphrase: "",
      rememberMe: false,
      passphraseError: "",
      rememberMeDuration: 300,
      biometricConfiguration: null,
      isBiometricAvailable: false,
      isUnlockingBiometric: false,
      enableBiometric: false,
      biometricError: "",
      biometricRpId: null,
    };
  }

  initEventHandlers() {
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRememberMeDurationSelectChange = this.handleRememberMeDurationSelectChange.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleBiometricUnlock = this.handleBiometricUnlock.bind(this);
  }

  /**
   * Initialise the rememberMe choice with the latest choice made by the user or false if none
   * @returns {Promise<void>}
   */
  async initDefaultRememberMeChoice() {
    const defaultRememberMeChoice = await this.props.context.port.request(
      "passbolt.remember-me.get-user-latest-choice",
    );
    this.setState({
      rememberMe: defaultRememberMeChoice,
      rememberMeDuration: this.getUntilILogOutDurationOrDefault(defaultRememberMeChoice),
    });
  }

  /**
   * Suspend Passkey provider during internal biometric authentication requests.
   * @param {Function} callback
   * @returns {Promise<*>}
   */
  async withPasskeySuspended(callback) {
    const runtime = (typeof browser !== "undefined" && browser?.runtime) || globalThis.chrome?.runtime;
    let suspended = false;
    if (runtime?.sendMessage) {
      try {
        const response = await runtime.sendMessage({ name: "passkey-provider.suspend" });
        suspended = response?.ok === true;
      } catch {
        // Ignored
      }
    }

    try {
      return await callback();
    } finally {
      if (suspended && runtime?.sendMessage) {
        try {
          await runtime.sendMessage({ name: "passkey-provider.resume" });
        } catch {
          // Ignored
        }
      }
    }
  }

  /**
   * Initialise biometric authentication availability and configuration
   * @returns {Promise<void>}
   */
  async initBiometricAuth() {
    const port = this.props.context?.port;
    if (!port) {
      return;
    }

    try {
      const storedConfig = await port.request("passbolt.biometric-auth.get-configuration").catch(() => null);
      let domain = null;
      try {
        domain = await port.request("passbolt.addon.get-domain");
      } catch {
        // Ignored
      }

      let rpId = null;
      if (domain) {
        try {
          rpId = new URL(domain.startsWith("http") ? domain : `https://${domain}`).hostname;
        } catch {
          rpId = domain;
        }
      }
      if (!rpId && storedConfig?.rp_id) {
        rpId = storedConfig.rp_id;
      }

      let compatibleConfig = null;
      if (storedConfig) {
        if (!rpId || !storedConfig.rp_id || storedConfig.rp_id === rpId) {
          compatibleConfig = storedConfig;
        }
      }

      let isAvailable = false;
      try {
        isAvailable = await port.request("passbolt.biometric-auth.is-available-in-page", rpId);
      } catch {
        isAvailable = false;
      }

      this.setState({
        biometricConfiguration: compatibleConfig,
        isBiometricAvailable: Boolean(isAvailable || compatibleConfig),
        biometricRpId: rpId,
      });
    } catch (error) {
      console.error("Biometric init error:", error);
    }
  }

  /**
   * Handle biometric unlock button click
   */
  async handleBiometricUnlock() {
    const port = this.props.context?.port;
    if (!port || !this.state.biometricConfiguration) {
      return;
    }

    this.setState({ isUnlockingBiometric: true, biometricError: "" });
    try {
      const passphrase = await this.withPasskeySuspended(async () => {
        return await port.request(
          "passbolt.biometric-auth.unlock-in-page",
          this.state.biometricConfiguration,
          this.state.biometricRpId,
        );
      });

      if (passphrase) {
        await this.handleValidPassphrase(passphrase);
      } else {
        throw new Error("No passphrase returned from biometric unlock.");
      }
    } catch (error) {
      console.error("Biometric unlock failed:", error);
      const isUk = (this.props.context?.locale || document.documentElement.lang || "uk").toLowerCase().startsWith("uk");
      this.setState({
        isUnlockingBiometric: false,
        biometricError: isUk
          ? "Не вдалося виконати вхід по відбитку пальця."
          : this.translate("Could not sign in with fingerprint."),
      });
    }
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createInputRef() {
    this.passphraseInputRef = React.createRef();
  }

  /**
   * Put the focus on the passphrase input
   */
  focusOnPassphrase() {
    if (this.passphraseInputRef.current) {
      this.passphraseInputRef.current.focus();
    }
  }

  /**
   * Close the dialog.
   */
  close() {
    const error = new UserAbortsOperationError("The dialog has been closed.");
    this.props.context.port.emit(this.props.context.passphraseRequestId, "ERROR", error);
    this.props.context.setContext({ passphraseRequestId: null });
    this.props.onClose();
  }

  /**
   * Handle close button click.
   */
  handleCloseClick() {
    this.close();
  }

  /**
   * Handle form submit event.
   * @params {ReactEvent} The react event
   * @return {Promise}
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    this.setState({ processing: true, biometricError: "" });
    if (await this.isValidPassphrase()) {
      await this.handleValidPassphrase();
    } else {
      this.handleInvalidPassphrase();
    }
  }

  /**
   * Check the passphrase.
   * @return {Promise<boolean>}
   */
  async isValidPassphrase() {
    try {
      await this.props.context.port.request("passbolt.keyring.private.checkpassphrase", this.state.passphrase);
    } catch (error) {
      console.error(`Invalid passphrase:`, error);
      return false;
    }
    return true;
  }

  /**
   * Check if remember me options are provided.
   */
  hasRememberMeOptions() {
    const options = this.props.context.siteSettings.getRememberMeOptions();

    return options !== null && Object.keys(options).length > 0;
  }

  /**
   * Handle valid passphrase
   */
  async handleValidPassphrase(validPassphrase = this.state.passphrase) {
    let rememberMe = false;
    if (this.state.rememberMe && this.hasRememberMeOptions()) {
      rememberMe = this.state.rememberMeDuration;
    }

    if (this.state.enableBiometric && !this.state.biometricConfiguration) {
      try {
        const port = this.props.context?.port;
        if (port) {
          const newConfig = await this.withPasskeySuspended(async () => {
            return await port.request(
              "passbolt.biometric-auth.create-configuration-in-page",
              validPassphrase,
              this.state.biometricRpId,
            );
          });
          if (newConfig) {
            await port.request("passbolt.biometric-auth.save-configuration", newConfig);
          }
        }
      } catch (err) {
        console.error("Could not enroll biometric on passphrase submit:", err);
      }
    }

    this.props.context.port.emit(this.props.context.passphraseRequestId, "SUCCESS", {
      passphrase: validPassphrase,
      rememberMe: rememberMe,
    });
    this.props.context.setContext({ passphraseRequestId: null });
    this.props.onClose();
  }

  /**
   * Handle invalid passphrase.
   */
  handleInvalidPassphrase() {
    const isPassphraseEmpty = this.state.passphrase === "";
    const passphraseError = isPassphraseEmpty
      ? this.translate("The passphrase should not be empty.")
      : this.translate("This is not a valid passphrase.");

    let attempt = this.state.attempt;
    if (!isPassphraseEmpty) {
      attempt++;
    }

    this.setState({
      processing: false,
      attempt: attempt,
      passphraseError: passphraseError,
    });
    if (attempt < 3) {
      // Force the passphrase input focus. The autoFocus attribute only works during the first rendering.
      this.focusOnPassphrase();
    }
  }

  /**
   * Handle form input changes.
   * @params {ReactEvent} The react event
   */
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  /**
   * Handle remember me duration selection change.
   * @params {ReactEvent} The react event
   */
  handleRememberMeDurationSelectChange(event) {
    this.setState({
      rememberMe: true,
      rememberMeDuration: event.target.value,
    });
  }

  /**
   * Render the remember me options
   * @returns {*[]}
   */
  renderRememberMeOptions() {
    const selectOptions = [];
    const rememberMeOptions = this.props.context.siteSettings.getRememberMeOptions();

    for (const time in rememberMeOptions) {
      selectOptions.push({ value: parseInt(time), label: rememberMeOptions[time] });
    }

    return selectOptions;
  }

  /**
   * Return the rememeberMe duration based on the last rememberMe choice.
   * - 1. It returns -1 if the rememberMe was checked
   * - 2. It returns the first option available that is different than -1 if rememberMe wasn't checked
   * @returns {integer} duration value
   */
  getUntilILogOutDurationOrDefault(rememberMe) {
    const allOptions = this.props.context.siteSettings.getRememberMeOptions();
    const limitedTimeOptions = Object.keys(allOptions).filter((option) => parseInt(option, 10) !== -1);
    const firstOption = parseInt(limitedTimeOptions.at(0), 10);

    if (!rememberMe) {
      return firstOption;
    }
    const untilILogoutOrFirstOption = (-1) in allOptions ? -1 : firstOption;
    return untilILogoutOrFirstOption;
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  get user() {
    return this.props.context?.account?.user || this.props.context?.loggedInUser || null;
  }

  get fullname() {
    const account = this.props.context?.account;
    const userSettings = this.props.context?.userSettings;
    const loggedInUser = this.props.context?.loggedInUser;
    return (
      userSettings?.fullName ||
      (account?.first_name ? `${account.first_name} ${account.last_name}` : "") ||
      (loggedInUser?.profile?.first_name ? `${loggedInUser.profile.first_name} ${loggedInUser.profile.last_name}` : "") ||
      ""
    );
  }

  get username() {
    const account = this.props.context?.account;
    const userSettings = this.props.context?.userSettings;
    const loggedInUser = this.props.context?.loggedInUser;
    return userSettings?.username || account?.username || loggedInUser?.username || "";
  }

  get trustedDomain() {
    const account = this.props.context?.account;
    const userSettings = this.props.context?.userSettings;
    return userSettings?.getTrustedDomain ? userSettings.getTrustedDomain() : (account?.domain || "");
  }

  /**
   * Render the component
   * @returns {JSX}
   */
  render() {
    const user = this.user;
    const fullname = this.fullname;
    const username = this.username;
    const trustedDomain = this.trustedDomain;
    const hasRememberMeOptions = this.hasRememberMeOptions();
    const isUk = (this.props.context?.locale || document.documentElement.lang || "uk").toLowerCase().startsWith("uk");

    let passphraseInputLabel = this.translate("Passphrase");
    if (this.state.passphraseError) {
      passphraseInputLabel = this.translate("Please enter a valid passphrase.");
    }

    return (
      <DialogWrapper
        className="passphrase-entry"
        title={this.translate("Please enter your passphrase.")}
        onClose={this.handleCloseClick}
      >
        {this.state.attempt < 3 && (
          <>
            {(user || fullname || username) && (
              <div className="login-user">
                <UserAvatar user={user} baseUrl={trustedDomain} className="big avatar user-avatar" />
                {fullname && <p className="login-user-name">{fullname}</p>}
                {username && <p className="login-user-email">{username}</p>}
              </div>
            )}
            {this.state.biometricConfiguration && (
              <div className="biometric-actions">
                <button
                  type="button"
                  className="button primary big full-width biometric-button"
                  disabled={this.state.processing || this.state.isUnlockingBiometric}
                  onClick={this.handleBiometricUnlock}
                >
                  <FingerprintSVG className="icon" />
                  <span>
                    {this.state.isUnlockingBiometric
                      ? (isUk ? "Розблокування..." : this.translate("Unlocking..."))
                      : (isUk ? "Вхід по відбитку пальця" : this.translate("Sign in with fingerprint"))}
                  </span>
                </button>
                {this.state.biometricError && <div className="error-message">{this.state.biometricError}</div>}
                <div className="biometric-divider">
                  <span>{isUk ? "або введіть парольну фразу" : this.translate("or enter passphrase")}</span>
                </div>
              </div>
            )}
            <form onSubmit={this.handleFormSubmit}>
              <div className="form-content">
                <div className={`input-password-wrapper input required ${this.state.passphraseError ? "error" : ""}`}>
                  <label htmlFor="passphrase-entry-form-passphrase">{passphraseInputLabel}</label>
                  <Password
                    id="passphrase-entry-form-passphrase"
                    name="passphrase"
                    autoComplete="off"
                    placeholder={this.translate("Passphrase")}
                    inputRef={this.passphraseInputRef}
                    value={this.state.passphrase}
                    onChange={this.handleInputChange}
                    disabled={this.state.processing || this.state.isUnlockingBiometric}
                    preview={true}
                    securityToken={this.props.context?.userSettings?.getSecurityToken ? this.props.context.userSettings.getSecurityToken() : null}
                  />
                  {this.state.passphraseError && <div className="error-message">{this.state.passphraseError}</div>}
                </div>
                {this.state.isBiometricAvailable && !this.state.biometricConfiguration && (
                  <div className="input checkbox biometric-enable">
                    <input
                      id="passphrase-entry-form-enable-biometric"
                      type="checkbox"
                      name="enableBiometric"
                      checked={this.state.enableBiometric}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="passphrase-entry-form-enable-biometric">
                      {isUk
                        ? "Увімкнути вхід по відбитку пальця на цьому пристрої"
                        : this.translate("Enable sign in with fingerprint on this device")}
                    </label>
                  </div>
                )}
                {hasRememberMeOptions && (
                  <div className="remember-me">
                    <div className="input checkbox">
                      <input
                        id="passphrase-entry-form-remember-me"
                        type="checkbox"
                        name="rememberMe"
                        checked={this.state.rememberMe}
                        onChange={this.handleInputChange}
                      />
                      <label htmlFor="passphrase-entry-form-remember-me">
                        <Trans>Remember it for</Trans>{" "}
                      </label>
                    </div>
                    <Select
                      className="inline"
                      name="rememberMeDuration"
                      items={this.renderRememberMeOptions()}
                      value={this.state.rememberMeDuration}
                      onChange={this.handleRememberMeDurationSelectChange}
                    />
                  </div>
                )}
              </div>
              <div className="submit-wrapper clearfix">
                <button type="button" className="cancel link" onClick={this.handleCloseClick}>
                  <Trans>Cancel</Trans>
                </button>
                <button
                  type="submit"
                  className="button primary form"
                  role="button"
                  disabled={this.state.processing || this.state.isUnlockingBiometric}
                >
                  <Trans>Ok</Trans>
                </button>
              </div>
            </form>
          </>
        )}
        {this.state.attempt === 3 && (
          <>
            <div className="form-content">
              <p>
                <Trans>Your passphrase is wrong! The operation has been aborted.</Trans>
              </p>
            </div>
            <div className="submit-wrapper clearfix">
              <button type="button" className="primary" onClick={this.handleCloseClick}>
                <Trans>Close</Trans>
              </button>
            </div>
          </>
        )}
      </DialogWrapper>
    );
  }
}

InputPassphrase.propTypes = {
  context: PropTypes.object, // The application context
  onClose: PropTypes.func,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withTranslation("common")(InputPassphrase));
