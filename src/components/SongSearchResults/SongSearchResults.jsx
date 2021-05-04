import React, {useEffect, useRef, useState} from 'react';
import { withRouter } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongList from '../SongList/SongList';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { getSongSearchResults } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './SongSearchResults.scss';

const SongSearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { currentVenue, searchResults, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const retriesRef = useRef(null);
  retriesRef.current = retries;

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleSearch = async () => {
    setLoading(true);

    const query = decodeURIComponent(props.match.params.query);

    let result = await getSongSearchResults(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, query);
    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getSongSearchResults(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, query);
    }

    if (!result && retriesRef.current < MAX_RETRIES) {
      setRetries(retriesRef.current + 1);

      await handleSearch();
    } else {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (props.match.params.query) {
        await handleSearch();
      }
    })();

  }, [ , props.match.params.query]);

  return (
    <ScreenContainer>
      {
        loading
          ? (
            <div className="d-flex align-items-center justify-content-center p-3">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
              {
                (searchResults.songs.items && searchResults.songs.items.length > 0)
                  ? (
                    <SongList songs={searchResults.songs} />
                  ) : (
                    <div className="p-3 text-center">
                      No songs, albums or artists matched your search.
                    </div>
                  )
              }
            </>
          )
      }
    </ScreenContainer>
  );
};

export default withRouter(SongSearchResults);
