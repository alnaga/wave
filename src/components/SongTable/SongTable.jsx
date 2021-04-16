import React from 'react';
import { Link } from 'react-router-dom';

import QueueSongButton from '../QueueSongButton/QueueSongButton';

import { formatSongLength } from '../../util';

import './SongTable.scss';

const SongTable = ({items, showAlbumArt = true, showAlbum = false, showArtist = true, showTrackNumber = false }) => {
  return (
    <table id="song-table">
      <thead className="mb-3">
        <tr>
          {
            showTrackNumber
              && <td> # </td>
          }

          {
            showAlbumArt
              && <td></td>
          }

          <td> Title </td>

          {
            showArtist
              && <td> Artist </td>
          }

          {
            showAlbum
              && <td> Album </td>
          }

          <td className="text-right"> Length </td>
        </tr>
      </thead>

      <tbody>
        {
          items.map((item, index) => (
            <tr key={item.id}>
              {
                showTrackNumber
                  && <td> { index + 1 } </td>
              }

              {
                showAlbumArt
                  && (
                    <td>
                      <Link to={`/album/${item.album.id}`}>
                        <img
                          alt={`${item.album.name} Album Art`}
                          src={item.album.images[0].url}
                          title={item.album.name}
                          width={64}
                        />
                      </Link>
                    </td>
                  )
              }

              <td> { item.name } </td>

              {
                showArtist
                  && <td> { item.artists[0].name } </td>
              }

              {
                showAlbum
                  && (
                    <td>
                      <Link to={`/album/${item.album.id}`}>
                        { item.album.name }
                      </Link>
                    </td>
                  )
              }

              <td className="text-right"> { formatSongLength(item.duration_ms) } </td>

              <td className="text-center">
                <QueueSongButton song={item} />
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

export default SongTable;
