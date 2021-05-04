import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import QueueSongButton from '../QueueSongButton/QueueSongButton';

import { formatSongLength, refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getNextSongSearchResultsPage } from '../../actions/spotify/spotifyActions';

import './SongList.scss';

const SongList = (props) => {
  const { songs, showArtist = true } = props;

  const dispatch = useAppDispatch();
  const { currentSong, currentVenue, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const retriesRef = useRef(null);
  retriesRef.current = retries;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetNextPage = async () => {
    setLoading(true);
    let result = await getNextSongSearchResultsPage(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, songs.next);

    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && currentVenue.id
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getNextSongSearchResultsPage(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, songs.next);
    }

    if (!result && retriesRef.current < MAX_RETRIES) {
      setRetries(retriesRef.current + 1);
      await handleGetNextPage();
    } else {
      setLoading(false);
    }
  };

  return (
    <div id="song-list">
      {
        loading
          ? (
            <div className="d-flex align-items-center justify-content-center p-3">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
              {
                songs.items && songs.items.map((song) => {
                  return (
                    <div
                      className={classNames({
                        'result': true,
                        'current': currentSong && currentSong.item.id === song.id
                      })}
                      key={song.id}
                    >
                      <div className="result-left">
                        {
                          song.album
                          && (
                            <Link to={`/album/${song.album.id}`}>
                              <img
                                alt={`${song.album.name} Album Art`}
                                src={song.album.images[0].url}
                                title={song.album.name}
                                width={64}
                              />
                            </Link>
                          )
                        }

                        <div className="ml-3 d-flex align-items-center">
                          {
                            currentSong && currentSong.item.id === song.id
                            && (
                              <FontAwesomeIcon icon={faPlay} className="mr-2" />
                            )
                          }

                          <div>
                            {
                              song.album
                                ? (
                                  <Link to={`/album/${song.album.id}`}>
                                    <div className="result-name" title={song.name}>
                                      { song.name }
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="result-name">
                                    { song.name }
                                  </div>
                                )
                            }

                            {
                              showArtist
                              && (
                                <div className="result-artist">
                                  <Link to={`/artist/${song.artists[0].id}`}>
                                    { song.artists[0].name }
                                  </Link>
                                </div>
                              )
                            }
                          </div>

                        </div>
                      </div>

                      <div className="align-items-center d-flex ml-3 mr-3">
                        <div>
                          { formatSongLength(song.duration_ms) }
                        </div>

                        <div className="ml-3 d-flex align-items-center">
                          <QueueSongButton song={song} />
                        </div>
                      </div>
                    </div>
                  );
                })
              }

              {
                songs.next
                && (
                  <div className="d-flex">
                    <button className="m-3" onClick={handleGetNextPage}> More Results </button>
                  </div>
                )
              }
            </>
          )
      }
    </div>
  );
};

export default SongList;
