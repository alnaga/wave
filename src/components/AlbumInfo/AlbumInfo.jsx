import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongList from '../SongList/SongList';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { getAlbumInfo } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './AlbumInfo.scss';

const AlbumInfo = (props) => {
  const { albumId } = props.match.params;
  const { albumInfo, tokens } = useAppState();
  const dispatch = useAppDispatch();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetAlbumInfo = async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && albumId
      && await getAlbumInfo(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, albumId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getAlbumInfo(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, albumId);
    }
  };

  useEffect(() => {
    (async () => {
      await handleGetAlbumInfo();
    })();
  }, []);

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
                  { albumInfo.artists[0].name }
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
