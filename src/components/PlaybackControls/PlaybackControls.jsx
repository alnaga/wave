import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faPause, faPlay, faStepForward, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

import VolumeSlider from '../VolumeSlider/VolumeSlider';

import { TOKENS_EXPIRED } from '../../constants';
import { refreshExpiredTokens } from '../../util';
import { useAppDispatch, useAppState } from '../../context/context';
import { getUserDevices, pauseSong, resumeSong, selectUserDevice, skipSong } from '../../actions/spotify/spotifyActions';

import './PlaybackControls.scss';

const PlaybackControls = (props) => {
  const { handleFetchCurrentSong } = props;

  const dispatch = useAppDispatch();
  const { currentSong, currentVenue, devices, tokens } = useAppState();

  const [ showList, setShowList ] = useState(false);
  const showListRef = useRef(null);
  showListRef.current = showList;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const currentVenueRef = useRef(null);
  currentVenueRef.current = currentVenue;

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
      && currentVenueRef.current
      && currentVenueRef.current.id
      && await getUserDevices(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getUserDevices(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);
    }
  };

  const handlePauseSong = async () => {
    let pauseResult = await pauseSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && pauseResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      pauseResult = await pauseSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);
    }

    // If pausing was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (pauseResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  }

  const handleResumeSong = async () => {
    let playResult = await resumeSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && playResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      playResult = await resumeSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);
    }

    // If playing was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (playResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  }

  const handleSkipSong = async () => {
    let skipResult = await skipSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && skipResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      skipResult = await skipSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);
    }

    // If skipping was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (skipResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  }

  const handleSelectDevice = (device) => async () => {
    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && await selectUserDevice(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id, device) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await selectUserDevice(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id, device);
    }

    setTimeout(async () => {
      await handleGetDevices();
    }, 250);
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
    <div id="playback-controls" className="ml-3">
      <span className="ui-button" id="show-device-list" onClick={handleToggleShowList} title="View list of available playback devices.">
        <FontAwesomeIcon id="show-device-list-icon" icon={faHeadphones} size="lg" />
      </span>

      {
        showList
          && (
            <div ref={listRef}>
              <div id="device-list-box" className="d-flex flex-column align-items-center ">
                <div id="device-list-title" className="p-2"> Playback Controls </div>

                <div id="device-list" className="d-flex flex-column flex-grow-1 width-full">
                  <label className="p-2"> Output Device </label>

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
                        <div id="no-devices" className="p-3">
                          No devices available.
                        </div>
                      )
                  }
                </div>

                <div id="playback-controls" className="p-3">
                  {
                    (currentSong && currentSong.is_playing)
                      ? (
                        <FontAwesomeIcon
                          className="mr-3 ui-button"
                          icon={faPause}
                          size="lg"
                          onClick={handlePauseSong}
                          title="Pause the current song"
                        />
                      ) : (
                        <FontAwesomeIcon
                          className="mr-3 ui-button"
                          icon={faPlay}
                          size="lg"
                          onClick={handleResumeSong}
                          title="Resume the current song"
                        />
                      )
                  }

                  <FontAwesomeIcon
                    className="ml-3 ui-button"
                    icon={faStepForward}
                    size="lg"
                    onClick={handleSkipSong}
                    title="Skip the current song"
                  />
                </div>

                <VolumeSlider />
              </div>

              <div id="tab" />
            </div>
          )
      }

    </div>
  );
};

export default PlaybackControls;

