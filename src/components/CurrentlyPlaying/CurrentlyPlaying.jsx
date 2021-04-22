import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';

import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Vote from '../Vote/Vote';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, WAVE_COLOUR_DARK } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentSong } from '../../actions/spotify/spotifyActions';

import './CurrentlyPlaying.scss';

// TODO: Hide bar when there is no song playing.
const CurrentlyPlaying = () => {
  const dispatch = useAppDispatch();
  const { currentSong, currentVenue, tokens } = useAppState();
  const [ songProgress, setSongProgress ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleFetchCurrentSong = async () => {
    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && currentVenue.id
      && await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, currentVenue.id) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);
    }
  }

  useEffect(() => {
    if (currentSong) {
      const { item, progress_ms } = currentSong;
      setSongProgress((progress_ms / item.duration_ms) * 100);
    }
  }, [ currentSong ]);
  
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

      <div id="currently-playing">
        {
          (currentSong && currentSong.item)
            ? (
              <>
                <div id="song-info" className="d-flex flex-grow-1 align-items-center">
                  <Link to={`/album/${currentSong.item.album.id}`}>
                    <img src={currentSong.item.album.images[0].url} alt={`Album Artwork for ${currentSong.item.album.name}`} />
                  </Link>

                  {
                    currentSong.is_playing
                      ? <FontAwesomeIcon id="mobile-play-icon" className="ml-3" icon={faPlay} />
                      : <FontAwesomeIcon id="mobile-play-icon" className="ml-3" icon={faPause} />
                  }

                  <div className="ml-3 mr-3">
                    <div id="song-title">
                      <Link to={`/album/${currentSong.item.album.id}`}>
                        { currentSong.item.name }
                      </Link>
                    </div>

                    <div id="artist-name">
                      <Link to={`/artist/${currentSong.item.artists[0].id}`}>
                        { currentSong.item.artists[0].name }
                      </Link>
                    </div>
                  </div>
                </div>

                <div id="song-controls" className="d-flex justify-content-end align-items-center">
                  <Vote />

                  <DeviceSelection />
                </div>
              </>
            ) : (
              <div id="no-song">
                No song currently playing.
              </div>
            )
        }
      </div>
    </>
  );
};

export default CurrentlyPlaying;
