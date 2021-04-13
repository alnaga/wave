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

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

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
    if (currentlyPlaying) {
      const { item, progress_ms } = currentlyPlaying;
      setSongProgress((progress_ms / item.duration_ms) * 100);
    }
  }, [ currentlyPlaying ]);
  
  useEffect(() => {
    (async () => {
      await handleFetchCurrentSong();

      const pollCurrentSong =  setInterval(async () => {
        await handleFetchCurrentSong();
      }, 5000);

      return () => {
        clearInterval(pollCurrentSong);
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
        transitionDuration="5s"
        transitionTimingFunction="linear"
      />

      <div id="currently-playing" className="d-flex justify-content-center align-items-center">
        {
          (currentlyPlaying && currentlyPlaying.item)
            ? (
              <>
                <div className="d-flex">
                  <div className="align-self-start">
                    <img src={currentlyPlaying.item.album.images[0].url} alt={`Album Artwork for ${currentlyPlaying.item.album.name}`} />
                  </div>
                </div>

                <div id="song-title" className="d-flex flex-column align-items-center">
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

                <div className="d-flex justify-content-between">
                  <DeviceSelection />
                </div>

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
