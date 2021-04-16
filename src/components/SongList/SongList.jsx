import React from 'react';
import { Link } from 'react-router-dom';

import QueueSongButton from '../QueueTrackButton/QueueTrackButton';

import { formatSongLength } from '../../util';

import './SongList.scss';

const SongList = (props) => {
  const {
    tracks,
    showArtist = true,
  } = props;

  return (
    <div id="song-list">
      {
        tracks.map((track) => {
          console.log(track)
          return (
            <div className="result" key={track.id}>
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

                <div className="ml-3">
                  {
                    track.album
                      ? (
                        <Link to={`/album/${track.album.id}`}>
                          <div className="result-name">
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
                          { track.artists[0].name }
                        </div>
                      )
                  }
                </div>
              </div>

              <div className="align-items-center d-flex ml-3 mr-3">
                <div>
                  { formatSongLength(track.duration_ms) }
                </div>

                <div className="ml-3">
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
