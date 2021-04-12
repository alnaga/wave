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

  const [ showList, setShowList ] = useState(false);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetDevices = async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await getUserDevices(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getUserDevices(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
    }
  };

  const handleSelectDevice = (device) => async () => {
    await selectUserDevice(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, device);
    await getUserDevices(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);

    if (!currentlyPlaying) {
      await getCurrentlyPlaying(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
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
