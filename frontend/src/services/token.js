
/*
 * Access Token Storage
 *
 * The access token is intentionally stored only in memory.
 *
 * Why?
 * - It is not persisted to localStorage/sessionStorage.
 * - It disappears when the browser page is refreshed/closed.
 * - The refresh token is NOT handled here.
 * - The refresh token is stored by the browser as an HttpOnly cookie.
 */

let accessToken = null;

/**
 * Get the current access token.
 */
export const getAccessToken = () => {
  return accessToken;
};

/**
 * Store/update the access token in memory.
 */
export const setAccessToken = (token) => {
  accessToken = token || null;
};

/**
 * Clear the access token from memory.
 */
export const clearAccessToken = () => {
  accessToken = null;
};

