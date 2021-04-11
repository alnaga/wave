import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';

import { TOKENS_EXPIRED } from '../../constants';
import { refreshExpiredTokens } from '../../util';
import { useAppDispatch, useAppState } from '../../context/context';
import {
  getCurrentlyPlaying,
  getUserDevices,
  selectUserDevice
} from '../../actions/spotify/spotifyActions';


const DeviceSelection = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyPlaying,
    devices,
    tokens
  } = useAppState();
  const { spotify, wave } = tokens;

  const [ showList, setShowList ] = useState(false);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetDevices = async () => {
    const { spotify, wave } = tokens;

    if (wave.accessToken && spotify.accessToken && await getUserDevices(dispatch, wave.accessToken, spotify.accessToken) === TOKENS_EXPIRED) {
      await refreshExpiredTokens(dispatch, tokens);
      await getUserDevices(dispatch, wave.accessToken, spotify.accessToken);
    }
  };

  const handleSelectDevice = (device) => async () => {
    await selectUserDevice(dispatch, wave.accessToken, spotify.accessToken, device);
    await getUserDevices(dispatch, wave.accessToken, spotify.accessToken);

    if (!currentlyPlaying) {
      await getCurrentlyPlaying(dispatch, wave.accessToken);
    }
  };

  return (
    <div id="select-devices">
      <span className="pointer" onClick={handleGetDevices} title="View list of available playback devices.">
        <FontAwesomeIcon icon={faHeadphones} size="lg" />
      </span>

      {
        devices.length > 0
          && (
            <div className="flex-column">
              {
                devices.map((device) => {
                  return (
                    <div className="flex" key={device.id} onClick={handleSelectDevice(device)}>
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
