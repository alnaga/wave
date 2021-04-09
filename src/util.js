export const accessTokenExpired = (expiration) => {
  return expiration < new Date().toISOString();
}

export const spotifyTokenExpired = (expiration) => {
  return expiration < Date.now();
};