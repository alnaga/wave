import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

import { TOKENS_EXPIRED } from '../../constants';
import { refreshExpiredTokens } from '../../util';
import { useAppDispatch, useAppState } from '../../context/context';
import { getUserDevices, selectUserDevice } from '../../actions/spotify/spotifyActions';

import './DeviceSelection.scss';

const DeviceSelection = () => {
  const dispatch = useAppDispatch();
  const { devices, tokens } = useAppState();

  const [ showList, setShowList ] = useState(false);
  const showListRef = useRef(null);
  showListRef.current = showList;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const listRef = useRef(null);

  const handleDetectClick = (event) => {
    if (
      showListRef.current
      && listRef.current
      && !listRef.current.contains(event.target)
      && event.target.parentNode.id !== 'show-device-list'
      && event.target.parentNode.id !== 'show-device-list-icon'
    ) {
      setShowList(false);
    }
  };

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
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await selectUserDevice(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, device) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await selectUserDevice(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, device);
    }

    await handleGetDevices();
  };

  const handleToggleShowList = () => {
    setShowList(!showList);
  };

  useEffect(() => {
    (async () => {
      if (showList) {
        await handleGetDevices();
      }
    })();
  }, [showList]);

  useEffect(() => {
    window.addEventListener('click', handleDetectClick);

    return () => {
      window.removeEventListener('click', handleDetectClick);
    }
  }, []);

  return (
    <div id="device-selection">
      <span className="ui-button" id="show-device-list" onClick={handleToggleShowList} title="View list of available playback devices.">
        <FontAwesomeIcon id="show-device-list-icon" icon={faHeadphones} size="lg" />
      </span>

      {
        showList
          && (
            <div ref={listRef}>
              <div id="device-list-box" className="d-flex flex-column align-items-center ">
                <div id="device-list-title" className="pl-3 pr-3 pt-3 pb-3"> Choose a device </div>

                <div id="device-list" className="d-flex flex-column flex-grow-1 width-full">
                  {
                    devices.length > 0
                      ? (
                        <>
                          {
                            devices.map((device) => {
                              return (
                                <div
                                  className={classNames({
                                    'active': device.is_active,
                                    'device-option': true,
                                    'text-bold': device.is_active
                                  })}
                                  key={device.id}
                                  onClick={handleSelectDevice(device)}
                                >
                                  <FontAwesomeIcon icon={faVolumeUp} />

                                  <span className="ml-2">
                                    { device.name }
                                  </span>
                                </div>
                              );
                            })
                          }
                        </>
                      ) : (
                        <>
                          No devices available.
                        </>
                      )
                  }
                </div>
              </div>

              <div id="tab" />
            </div>
          )
      }

    </div>
  );
};

export default DeviceSelection;
