/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.3.0
 */
import { PasswordGenerator } from "./PasswordGenerator";
import { PassphraseGenerator } from "./PassphraseGenerator";
import { SecretGeneratorComplexity } from "./SecretGeneratorComplexity";

export const DEFAULT_GENERATOR_CONFIGURATION = {
  default_generator: "password",
  external_dictionary_check: true,
  password_generator_settings: {
    length: 18,
    min_length: 8,
    max_length: 128,
    mask_upper: true,
    mask_lower: true,
    mask_digit: true,
    mask_parenthesis: true,
    mask_char1: true,
    mask_char2: true,
    mask_char3: true,
    mask_char4: true,
    mask_char5: true,
    mask_emoji: false,
    exclude_look_alike_chars: true,
  },
  passphrase_generator_settings: {
    words: 9,
    min_words: 4,
    max_words: 40,
    word_separator: " ",
    word_case: "lowercase",
  },
  source: "default",
};

export const SecretGenerator = {
  /**
   * Generate a secret given a generator configuration
   * @param {PasswordPoliciesDto} configuration A generator configuration
   * @return {string} A generated secret
   */
  generate: (configuration) => {
    if (!configuration) {
      return "";
    }
    const type = configuration.default_generator || "password";
    if (type === "password") {
      const passwordSettings =
        configuration.password_generator_settings || DEFAULT_GENERATOR_CONFIGURATION.password_generator_settings;
      return PasswordGenerator.generate(passwordSettings);
    } else if (type === "passphrase") {
      const passphraseSettings =
        configuration.passphrase_generator_settings || DEFAULT_GENERATOR_CONFIGURATION.passphrase_generator_settings;
      return PassphraseGenerator.generate(passphraseSettings);
    }
    return "";
  },
  /**
   * Calculates the secret entropy
   * @param {string} secret A secret
   * @return {Number} The secret entropy
   */
  entropy: (secret) => {
    if (!secret || typeof secret !== "string") {
      return null;
    }
    const { numberWords, separator, isPassphrase } = PassphraseGenerator.detectPassphrase(secret);
    if (isPassphrase) {
      return SecretGeneratorComplexity.entropyPassphrase(numberWords, separator);
    } else {
      return SecretGeneratorComplexity.entropyPassword(secret);
    }
  },
};
