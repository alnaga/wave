import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';

import './AlbumList.scss';
import { getNextArtistAlbumsPage } from '../../actions/spotify/spotifyActions';

const AlbumList = (props) => {
  const { albums } = props;

  const dispatch = useAppDispatch();
  const { currentVenue, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const retriesRef = useRef(null);
  retriesRef.current = retries;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  // Fetches the next page of results, retrying if necessary.
  const handleGetNextPage = async () => {
    setLoading(true);
    let result = await getNextArtistAlbumsPage(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, albums.next);

    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && currentVenue.id
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getNextArtistAlbumsPage(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, albums.next);
    }

    if (!result && retriesRef.current < MAX_RETRIES) {
      setRetries(retriesRef.current + 1);
      await handleGetNextPage();
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="album-list">
        {
          loading
            ? (
              <>
                <div className="d-flex align-items-center justify-content-center p-3">
                  <Spinner animation="border" role="status" />
                </div>
              </>
            ) : (
              <>
                {
                  albums.items && albums.items.map((album) => {
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
              </>
            )
        }
      </div>

      {
        albums.next
          && (
            <div className="d-flex">
              <button className="m-3" onClick={handleGetNextPage}> More Releases </button>
            </div>
          )
      }
    </>
  );
};

export default AlbumList;
