import React, { useEffect, useRef, useState } from 'react';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { updateVolume } from '../../actions/spotify/spotifyActions';

import './VolumeSlider.scss';

const VolumeSlider = () => {
  const dispatch = useAppDispatch();
  const { currentVenue, devices, tokens } = useAppState();

  const [ volumeTimeout, setVolumeTimeout ] = useState();
  const [ volume, setVolume ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

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
    <div className="volume-slider pl-3 pr-3 pt-2 pb-1">
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
