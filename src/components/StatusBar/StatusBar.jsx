import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStoreAlt } from '@fortawesome/free-solid-svg-icons';

import PlaybackControls from '../PlaybackControls/PlaybackControls';
import Vote from '../Vote/Vote';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, WAVE_COLOUR_DARK } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentSong } from '../../actions/spotify/spotifyActions';

import './StatusBar.scss';

const StatusBar = () => {
  const dispatch = useAppDispatch();
  const { currentSong, currentVenue, tokens } = useAppState();
  const [ songProgress, setSongProgress ] = useState(0);

  const [ pollCurrentSongInterval, setPollCurrentSongInterval ] = useState();

  const currentSongRef = useRef(null);
  currentSongRef.current = currentSong;

  const currentVenueRef = useRef(null);
  currentVenueRef.current = currentVenue;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleFetchCurrentSong = async () => {
    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, currentVenueRef.current.id);
    }
  }

  useEffect(() => {
    if (currentSong) {
      const { item, progress_ms } = currentSong;
      setSongProgress((progress_ms / item.duration_ms) * 100);
    } else {
      setSongProgress(0);
    }
  }, [ currentSong ]);

  useEffect(() => {
    (async () => {
      // This checks to see whether there is a venue the user is currently checked into
      // and whether the client is polling the current song.
      // When the user checks out of a venue it will stop polling the current song to save
      // on performance.
      if (currentVenue && !pollCurrentSongInterval) {
        setPollCurrentSongInterval(setInterval(async () => {
          await handleFetchCurrentSong();
        }, 5000));
      } else if (!currentVenue && pollCurrentSongInterval) {
        clearInterval(pollCurrentSongInterval);
        setPollCurrentSongInterval();
        setSongProgress(0);
      }

      return () => {
        if (pollCurrentSongInterval) {
          clearInterval(pollCurrentSongInterval);
        }
      };
    })();
  }, [currentVenue]);

  useEffect(() => {
    (async () => {
      await handleFetchCurrentSong()
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

      <div id="status-bar">
        {
          currentVenue
            ? (
              <>
                {
                  currentSong && currentSong.item
                    ? (
                      <div id="song-info" className="d-flex flex-grow-1 align-items-center">
                        <Link to={`/album/${currentSong.item.album.id}`}>
                          <img src={currentSong.item.album.images[0].url} alt={`Album Artwork for ${currentSong.item.album.name}`} />
                        </Link>

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
                    ) : (
                      <div className="d-flex flex-grow-1 ml-3 mr-3">
                        No song playing
                      </div>
                    )
                }

                <div id="song-controls" className="d-flex justify-content-end align-items-center pr-3">
                  <Vote />

                  <Link to={`/venue/${currentVenue.id}`} title={`Go to ${currentVenue.name}'s page`}>
                    <FontAwesomeIcon className="ml-3 ui-button" icon={faStoreAlt} size="lg" />
                  </Link>

                  {
                    (tokens.wave.user && currentVenue.owners && currentVenue.owners.find((owner) => owner.username === tokens.wave.user.username))
                    && (
                      <PlaybackControls handleFetchCurrentSong={handleFetchCurrentSong} />
                    )
                  }
                </div>
              </>
            ) : (
              <>
                Not checked into a venue
              </>
            )
        }
      </div>
    </>
  );
};

export default StatusBar;
