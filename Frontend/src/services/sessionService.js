let currentUser = null;
let accessToken = null;

export const setCurrentUser = (user) => {
  currentUser = user;
};

export const updateCurrentUser = (partialUser) => {
  currentUser = {
    ...(currentUser || {}),
    ...(partialUser || {}),
  };

  return currentUser;
};

export const getCurrentUser = () => currentUser;
//aquí esta el token
export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearCurrentUser = () => {
  currentUser = null;
  accessToken = null;
};
