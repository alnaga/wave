import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@ramonak/react-progress-bar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay, faStepForward, faStoreAlt } from '@fortawesome/free-solid-svg-icons';

import DeviceSelection from '../DeviceSelection/DeviceSelection';
import Vote from '../Vote/Vote';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, WAVE_COLOUR_DARK } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentSong, pauseTrack, playTrack, skipTrack } from '../../actions/spotify/spotifyActions';

import './CurrentlyPlaying.scss';

// TODO: Hide bar when there is no song playing.
const CurrentlyPlaying = () => {
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

  const handlePauseTrack = async () => {
    let pauseResult = await pauseTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && pauseResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      pauseResult = await pauseTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);
    }

    // If skipping was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (pauseResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  }

  const handlePlayTrack = async () => {
    let playResult = await playTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && playResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      playResult = await playTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);
    }

    // If skipping was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (playResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  }

  const handleSkipTrack = async () => {
    let skipResult = await skipTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);

    if (
      tokensRef.current.wave.accessToken
      && currentVenueRef.current
      && currentVenueRef.current.id
      && skipResult === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      skipResult = await skipTrack(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);
    }

    // If skipping was successful, wait for Spotify to carry out the skip and then fetch the new song.
    if (skipResult === 1) {
      setTimeout(async () => {
        await handleFetchCurrentSong();
      }, 250);
    }
  };

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

      <div id="currently-playing">
        {
          currentVenue
            ? (
              <>
                {
                  currentSong && currentSong.item
                    ? (
                      <>
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


                      </>
                    ) : (
                      <>
                        No song playing.
                      </>
                    )
                }

                <div id="song-controls" className="d-flex justify-content-end align-items-center pr-3">
                  <Vote />

                  <Link to={`/venue/${currentVenue.id}`}>
                    <FontAwesomeIcon className="ml-3 ui-button" icon={faStoreAlt} size="lg" />
                  </Link>

                  {
                    currentVenue.owners && currentVenue.owners.find((owner) => owner.username === tokens.wave.user.username)
                    && (
                      <>
                        {
                          currentSong
                            && (
                              <>
                                {
                                  currentSong.is_playing
                                    ? (
                                      <FontAwesomeIcon
                                        className="ml-3 ui-button"
                                        icon={faPause}
                                        size="lg"
                                        onClick={handlePauseTrack}
                                        title="Pause the current track"
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        className="ml-3 ui-button"
                                        icon={faPlay}
                                        size="lg"
                                        onClick={handlePlayTrack}
                                        title="Resume the current track"
                                      />
                                    )
                                }

                                <FontAwesomeIcon
                                  className="ml-3 ui-button"
                                  icon={faStepForward}
                                  size="lg"
                                  onClick={handleSkipTrack}
                                  title="Skip the current track"
                                />
                              </>
                            )
                        }

                        <DeviceSelection />
                      </>
                    )
                  }
                </div>
              </>
            ) : (
              <>
                Not checked into a venue.
              </>
            )
        }
      </div>
    </>
  );
};

export default CurrentlyPlaying;
