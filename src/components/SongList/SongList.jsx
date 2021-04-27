import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import QueueSongButton from '../QueueTrackButton/QueueTrackButton';

import { useAppState } from '../../context/context';
import { formatSongLength } from '../../util';

import './SongList.scss';

const SongList = (props) => {
  const {
    tracks,
    showArtist = true,
  } = props;

  const { currentSong } = useAppState();

  return (
    <div id="song-list">
      {
        tracks.map((track) => {
          return (
            <div
              className={classNames({
                'result': true,
                'current': currentSong && currentSong.item.id === track.id
              })}
              key={track.id}
            >
              <div className="result-left">
                {
                  track.album
                    && (
                      <Link to={`/album/${track.album.id}`}>
                        <img
                          alt={`${track.album.name} Album Art`}
                          src={track.album.images[0].url}
                          title={track.album.name}
                          width={64}
                        />
                      </Link>
                    )
                }

                <div className="ml-3 d-flex align-items-center">
                  {
                    currentSong && currentSong.item.id === track.id
                      && (
                        <FontAwesomeIcon icon={faPlay} className="mr-2" />
                      )
                  }

                  <div>
                    {
                      track.album
                        ? (
                          <Link to={`/album/${track.album.id}`}>
                            <div className="result-name" title={track.name}>
                              { track.name }
                            </div>
                          </Link>
                        ) : (
                          <div className="result-name">
                            { track.name }
                          </div>
                        )
                    }

                    {
                      showArtist
                      && (
                        <div className="result-artist">
                          <Link to={`/artist/${track.artists[0].id}`}>
                            { track.artists[0].name }
                          </Link>
                        </div>
                      )
                    }
                  </div>

                </div>
              </div>

              <div className="align-items-center d-flex ml-3 mr-3">
                <div>
                  { formatSongLength(track.duration_ms) }
                </div>

                <div className="ml-3 d-flex align-items-center">
                  <QueueSongButton track={track} />
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

export default SongList;
