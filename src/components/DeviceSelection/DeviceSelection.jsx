import React, { useRef } from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import {
  getCurrentlyPlaying,
  getUserDevices,
  selectUserDevice
} from '../../actions/spotify/spotifyActions';

import { retryAction } from '../../util';

export const handleGetDevices = async (dispatch, tokens) => {
  const { spotify, wave } = tokens;
  const args = [
    { 'waveAccessToken': wave.accessToken },
    { 'spotifyAccessToken': spotify.accessToken }
  ];

  await retryAction(getUserDevices, tokens, dispatch, args);
};

const DeviceSelection = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyPlaying,
    devices,
    tokens
  } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

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
        onClick={() => handleGetDevices(dispatch, tokens)}
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
