import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { updateVolume } from '../../actions/spotify/spotifyActions';

import './VolumeSlider.scss';

const VolumeSlider = () => {
  const dispatch = useAppDispatch();
  const { currentVenue, devices, tokens } = useAppState();

  const [ previousVolume, setPreviousVolume ] = useState(0)
  const [ volumeTimeout, setVolumeTimeout ] = useState();
  const [ volume, setVolume ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleToggleMuteVolume = async () => {
    if (volume === 0) {
      setVolume(previousVolume);

      await handleVolumeChange({
        target: {
          value: previousVolume
        }
      });
    } else {
      setPreviousVolume(volume);

      await handleVolumeChange({
        target: {
          value: 0
        }
      });
    }
  }

  const handleVolumeChange = async (event) => {
    setVolume(event.target.value);

    if (volumeTimeout) {
      clearTimeout(volumeTimeout)
    }

    setVolumeTimeout(setTimeout(async () => {
      if (
        tokensRef.current.wave.accessToken
        && currentVenue
        && currentVenue.id
        && await updateVolume(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, event.target.value) === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokensRef.current);
        await updateVolume(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, event.target.value);
      }
    }, 500));
  };

  useEffect(() => {
    if (devices.length) {
      const activeDevice = devices.find((device) => device.is_active);

      if (activeDevice) {
        setVolume(activeDevice.volume_percent);
      }
    }
  }, [devices])
  
  return (
    <div className="volume-slider d-flex align-items-center pl-3 pr-3 pt-2 pb-2">
      {
        volume > 0
          ? (
            <FontAwesomeIcon className="mr-3 ui-button" icon={faVolumeUp} size="lg" onClick={handleToggleMuteVolume} />
          ) : (
            <FontAwesomeIcon className="mr-3 ui-button" icon={faVolumeMute} size="lg" onClick={handleToggleMuteVolume} />
          )
      }


      <input
        disabled={devices.length < 1}
        type="range"
        min="0"
        max="100"
        onChange={handleVolumeChange}
        value={volume}
      />
    </div>
  );
};

export default VolumeSlider;
