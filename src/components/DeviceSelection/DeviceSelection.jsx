import React from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { refreshAccessToken } from '../../actions/account/accountActions';
import {
  getCurrentlyPlaying,
  getUserDevices,
  refreshSpotifyAuthToken,
  selectUserDevice
} from '../../actions/spotify/spotifyActions';
import { accessTokenExpired, spotifyTokenExpired } from '../../util';

export const handleGetDevices = async (dispatch, accessToken, refreshToken, spotifyAccessToken, spotifyRefreshToken) => {
  // console.log('Access Token Expired:', accessTokenExpired());
  // console.log('Spotify Access Token Expired:', spotifyTokenExpired());

  if (accessTokenExpired()) await refreshAccessToken(dispatch, refreshToken);
  if (spotifyTokenExpired()) await refreshSpotifyAuthToken(dispatch, spotifyRefreshToken);
  // console.log('Devices', await getUserDevices(dispatch, accessToken, spotifyAccessToken));
};

const DeviceSelection = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyPlaying,
    devices,
    tokens
  } = useAppState();

  const { spotify, wave } = tokens;

  const handleSelectDevice = (device) => async () => {
    await selectUserDevice(dispatch, wave.accessToken, spotify.accessToken, device);
    await getUserDevices(dispatch, wave.accessToken, spotify.accessToken);

    if (!currentlyPlaying) {
      await getCurrentlyPlaying(dispatch, wave.accessToken);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleGetDevices(dispatch, wave.accessToken, wave.refreshToken, spotify.accessToken, spotify.refreshToken)}
      >
        Get Devices
      </button>
      {
        devices.length > 0
          && (
            <div className="flex-column">
              {
                devices.map((device) => {
                  return (
                    <div className="flex" onClick={handleSelectDevice(device)}>
                      { device.name }
                      {
                        device.is_active
                          && (
                            <span> - Active </span>
                          )
                      }
                    </div>
                  );
                })
              }
            </div>
          )
      }
    </div>
  );
};

export default DeviceSelection;
