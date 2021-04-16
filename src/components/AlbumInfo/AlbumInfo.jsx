import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongTable from '../SongTable/SongTable';

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

  console.log('test');

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
            <div id="album-header" className="d-flex align-items-center pl-3 pr-3 pt-3">
              <div>
                <img src={albumInfo.images[1].url} width="196"/>
              </div>

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

            <SongTable
              items={albumInfo.tracks.items}
              showAlbum={false}
              showAlbumArt={false}
              showArtist={false}
              showTrackNumber={true}
            />
          </>
        )
      }
    </ScreenContainer>
  );
};

export default withRouter(AlbumInfo);
