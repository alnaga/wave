import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';

import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Vote from '../Vote/Vote';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, WAVE_COLOUR_DARK } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying } from '../../actions/spotify/spotifyActions';

const CurrentlyPlaying = () => {
  const dispatch = useAppDispatch();
  const { currentlyPlaying, tokens } = useAppState();
  const [ songProgress, setSongProgress ] = useState(0);

  const currentlyPlayingRef = useRef(null);
  currentlyPlayingRef.current = currentlyPlaying;

  const setSongProgressRef = useRef(null);
  setSongProgressRef.current = setSongProgress;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const checkSongProgress = async () => {
    if (currentlyPlayingRef) {
      await handleFetchCurrentSong();

      if (currentlyPlayingRef.current) {
        const { item, progress_ms } = currentlyPlayingRef.current;
        setSongProgressRef.current((progress_ms / item.duration_ms) * 100);
      }
    }
  };

  const handleFetchCurrentSong = async () => {
    if (
      tokensRef.current.spotify.accessToken
      && await getCurrentlyPlaying(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getCurrentlyPlaying(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
    }
  }
  
  useEffect(() => {
    (async () => {
      await checkSongProgress();

      const pollSongProgress =  setInterval(async () => {
        await checkSongProgress();
      }, 3000);

      return () => {
        clearInterval(pollSongProgress);
      }
    })();
  }, []);

  return (
    <>
      <ProgressBar
        baseBgColor="rgba(100, 100, 100, 0.25)"
        bgColor={`${WAVE_COLOUR_DARK}`}
        borderRadius="0px"
        className="position-fixed song-progress width-full"
        completed={songProgress}
        height="6px"
        isLabelVisible={false}
        transitionDuration="3s"
        transitionTimingFunction="linear"
      />

      <div id="currently-playing" className="d-flex justify-content-center align-items-center">
        {
          (currentlyPlaying && currentlyPlaying.item)
            ? (
              <>
                <div className="position-absolute left-0">
                  <img src={currentlyPlaying.item.album.images[0].url} />
                </div>

                <div className="d-flex flex-column align-items-center">
                  <div className="mb-1">
                    {
                      currentlyPlaying.item.artists[0].name
                    }
                    {' '} - {' '}
                    {
                      currentlyPlaying.item.name
                    }
                  </div>

                  <Vote />
                </div>

                {/*<DeviceSelection />*/}
              </>
            ) : (
              <div>
                No song currently playing.
              </div>
            )
        }
      </div>
    </>
  );
};

export default CurrentlyPlaying;
