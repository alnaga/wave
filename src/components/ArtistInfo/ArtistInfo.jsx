import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { Textfit } from 'react-textfit';

import AlbumList from '../AlbumList/AlbumList';
import ScreenContainer from '../ScreenContainer/ScreenContainer';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { getArtistInfo } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './ArtistInfo.scss';

const ArtistInfo = (props) => {
  const { artistId } = props.match.params;
  const { artistInfo, currentVenue, tokens } = useAppState();
  const dispatch = useAppDispatch();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetArtistInfo = async () => {
    if (
      tokensRef.current.wave.accessToken
      && artistId
      && currentVenue
      && currentVenue.id
      && await getArtistInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, artistId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getArtistInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, artistId);
    }
  };

  useEffect(() => {
    (async () => {
      await handleGetArtistInfo();
    })();
  }, [artistId]);

  return (
    <ScreenContainer id="artist-info">
      {
        artistInfo
          && (
            <>
              <div id="artist-header">
                <img
                  alt={`${artistInfo.name} Artist Picture`}
                  src={artistInfo.images[0].url}
                  title={artistInfo.name}
                />

                <Textfit id="artist-name" className="pl-4 pr-4 pb-2 pt-2" min={36}>
                  { artistInfo.name }
                </Textfit>
              </div>

              <div id="album-list-container">
                {
                  (artistInfo.albums && artistInfo.albums.items.length > 0)
                    && <AlbumList albums={artistInfo.albums.items} />
                }
              </div>
            </>
          )
      }
    </ScreenContainer>
  );
};

export default withRouter(ArtistInfo);
