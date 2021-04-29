import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { Textfit } from 'react-textfit';

import AlbumList from '../AlbumList/AlbumList';
import ScreenContainer from '../ScreenContainer/ScreenContainer';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { getArtistInfo } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './ArtistInfo.scss';

const ArtistInfo = (props) => {
  const { artistId } = props.match.params;
  const { artistInfo, currentVenue, tokens } = useAppState();
  const dispatch = useAppDispatch();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetArtistInfo = async () => {
    setLoading(true);

    let result = await getArtistInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, artistId);

    if (
      tokensRef.current.wave.accessToken
      && artistId
      && currentVenue
      && currentVenue.id
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getArtistInfo(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, artistId);
    }

    if (!result && retries < MAX_RETRIES) {
      setRetries(retries + 1);

      await handleGetArtistInfo();
    } else {
      setLoading(false);
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
        loading
          ? (
            <div className="d-flex align-items-center justify-content-center p-3">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
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
            </>
          )
      }
    </ScreenContainer>
  );
};

export default withRouter(ArtistInfo);
