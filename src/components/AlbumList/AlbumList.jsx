import React from 'react';
import { Link } from 'react-router-dom';

import './AlbumList.scss';

const AlbumList = (props) => {
  const { albums } = props;

  return (
    <div id="album-list">
      {
        albums.map((album) => {
          if (album.album_group !== 'appears_on') {
            return (
              <Link
                className="album"
                key={album.id}
                to={`/album/${album.id}`}
              >
                <div className="album-art">
                  <img
                    alt={`${album.name} Album Art`}
                    src={album.images[1].url}
                    title={album.name}
                  />
                </div>

                <div className="album-title">
                  { album.name }
                </div>

                <div className="album-type">
                  {
                    album.album_type === 'album'
                      ? 'Album'
                      : album.total_tracks > 2
                      ? 'EP'
                      : 'Single'
                  }
                </div>

                <div className="album-release-year">
                  { album.release_date.split('-')[0] }
                </div>
              </Link>
            );
          }
        })
      }
    </div>
  );
};

export default AlbumList;
