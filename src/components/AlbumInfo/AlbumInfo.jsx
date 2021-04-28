import React, { useEffect, useRef } from 'react';
import { Link, withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongList from '../SongList/SongList';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { getAlbumInfo } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './AlbumInfo.scss';

const AlbumInfo = (props) => {
  const { albumId } = props.match.params;
  const { albumInfo, currentVenue, tokens } = useAppState();
  const dispatch = useAppDispatch();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetAlbumInfo = async () => {
    if (
      tokensRef.current.wave.accessToken
      && albumId
      && currentVenue
      && currentVenue.id
      && await getAlbumInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, albumId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getAlbumInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, albumId);
    }
  };

  // TODO: Scroll to the top when navigating to this component.
  useEffect(() => {
    (async () => {
      await handleGetAlbumInfo();
    })();
  }, [albumId]);

  return (
    <ScreenContainer id="album-info">
      {
        albumInfo
        && (
          <>
            <div id="album-header" className="p-3">
              <img
                alt={`${albumInfo.name} Album Art`}
                src={albumInfo.images[1].url}
                title={albumInfo.name}
              />

              <div className="d-flex flex-column flex-grow-1 ml-3">
                <div>
                  { albumInfo.name }
                </div>

                <div id="album-artist">
                  <Link to={`/artist/${albumInfo.artists[0].id}`}>
                    { albumInfo.artists[0].name }
                  </Link>
                </div>

                <div id="album-release-date">
                  { albumInfo.release_date.split('-')[0] }
                </div>
              </div>
            </div>

            <SongList showArtist={false} tracks={albumInfo.tracks.items} />
          </>
        )
      }
    </ScreenContainer>
  );
};

export default withRouter(AlbumInfo);
