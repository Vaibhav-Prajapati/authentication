let accessToken = null;

export const getAccessToken = () => {
  return accessToken;
};

export const setAccessToken = (access) => {
  accessToken = access;
};

export const setTokens = (access) => {
  if (access) {
    accessToken = access;
  }
};

export const clearTokens = () => {
  accessToken = null;
};
