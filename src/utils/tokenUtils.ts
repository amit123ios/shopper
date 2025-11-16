// utils/tokenUtils.js
import crypto from "crypto";

/**
 * Generate a secure random refresh token
 * @returns {string} refreshToken
 */
export function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex"); // 80-char hex string
}

/**
 * Generate a random string (can be used for CSRF tokens, API keys, etc.)
 * @param {number} length - length of string
 * @returns {string}
 */
export function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/*module.exports = {
  generateRefreshToken,
  generateRandomString,
};*/
