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
import "../../../react-extension/test/lib/crypto/cryptoGetRandomvalues";
import { SecretGenerator, DEFAULT_GENERATOR_CONFIGURATION } from "./SecretGenerator";

describe("SecretGenerator", () => {
  describe("generate", () => {
    it("should return empty string if configuration is null or undefined", () => {
      expect(SecretGenerator.generate(null)).toBe("");
      expect(SecretGenerator.generate(undefined)).toBe("");
    });

    it("should generate a password with valid configuration", () => {
      const password = SecretGenerator.generate(DEFAULT_GENERATOR_CONFIGURATION);
      expect(typeof password).toBe("string");
      expect(password.length).toBe(18);
    });

    it("should generate a passphrase when default_generator is passphrase", () => {
      const passphraseConfig = {
        default_generator: "passphrase",
        passphrase_generator_settings: {
          words: 5,
          min_words: 3,
          max_words: 40,
          word_separator: " ",
          word_case: "lowercase",
        },
      };
      const passphrase = SecretGenerator.generate(passphraseConfig);
      expect(typeof passphrase).toBe("string");
      expect(passphrase.split(" ").length).toBe(5);
    });
  });

  describe("entropy", () => {
    it("should return null for null, undefined, empty or non-string secrets", () => {
      expect(SecretGenerator.entropy(null)).toBeNull();
      expect(SecretGenerator.entropy(undefined)).toBeNull();
      expect(SecretGenerator.entropy("")).toBeNull();
      expect(SecretGenerator.entropy(123)).toBeNull();
    });

    it("should return valid entropy for password and passphrase", () => {
      expect(SecretGenerator.entropy("correct horse battery staple")).toBeGreaterThan(0);
      expect(SecretGenerator.entropy("P4ssw0rd!123")).toBeGreaterThan(0);
    });
  });
});
