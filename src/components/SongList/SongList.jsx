import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import QueueSongButton from '../QueueSongButton/QueueSongButton';

import { useAppState } from '../../context/context';
import { formatSongLength } from '../../util';

import './SongList.scss';

const SongList = (props) => {
  const {
    songs,
    showArtist = true,
  } = props;

  const { currentSong } = useAppState();

  return (
    <div id="song-list">
      {
        songs.map((song) => {
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
    </div>
  );
};

export default SongList;
