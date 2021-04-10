import { refreshAccessToken } from './actions/account/accountActions';
import { refreshSpotifyAuthToken } from './actions/spotify/spotifyActions';

export const accessTokenExpired = (expiration) => {
  return expiration < new Date().toISOString();
}

export const spotifyTokenExpired = (expiration) => {
  return expiration < Date.now();
};

export const retryAction = async (action, tokens, dispatch, args) => {
  const { spotify, wave } = tokens;

  let argsToUpdate = [];
  let passedArgs = [];

  const targetPropertyNames = [
    'spotifyAccessToken',
    'spotifyRefreshToken',
    'waveAccessToken',
    'waveRefreshToken'
  ];

  args.map((arg, index) => {
    const propertyName = Object.getOwnPropertyNames(arg)[0];
    passedArgs.push(arg[propertyName]);

    if (targetPropertyNames.includes(propertyName)) {
      argsToUpdate.push({
        index,
        propertyName
      });
    }
  });

  if (await action(dispatch, ...passedArgs) === 2) {
    const newTokens = {
      ...tokens
    };

    if (accessTokenExpired(wave.accessTokenExpiresAt)) {
      newTokens.wave = await refreshAccessToken(dispatch, wave.refreshToken);
    }

    if (spotifyTokenExpired(spotify.accessTokenExpiresAt)) {
      newTokens.spotify = await refreshSpotifyAuthToken(dispatch, spotify.refreshToken);
    }

    let newPassedArgs = passedArgs;

    argsToUpdate.map((arg) => {
      let value = passedArgs[arg.index];

      switch (arg.propertyName) {
        case 'spotifyAccessToken':
          value = newTokens.spotify.accessToken;
          break;
        case 'spotifyRefreshToken':
          value = newTokens.spotify.refreshToken;
          break;
        case 'waveAccessToken':
          value = newTokens.wave.accessToken;
          break;
        case 'waveRefreshToken':
          value = newTokens.wave.refreshToken;
          break;
      }

      newPassedArgs[arg.index] = value;
    });

    await action(dispatch, ...newPassedArgs);
  }
};