import React, {useEffect, useRef, useState} from 'react';
import { withRouter } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongList from '../SongList/SongList';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { getTrackSearchResults } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './TrackSearchResults.scss';

const TrackSearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { currentVenue, searchResults, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  // TODO: Implement fetching songs from subsequent pages if there are enough results.
  const handleSearch = async () => {
    setLoading(true);

    const query = decodeURIComponent(props.match.params.query);

    let result = await getTrackSearchResults(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, query);
    if (
      tokensRef.current.wave.accessToken
      && currentVenue
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getTrackSearchResults(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, query);
    }

    if (!result && retries < MAX_RETRIES) {
      setRetries(retries + 1);

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
                searchResults.tracks.length > 0
                  ? (
                    <SongList tracks={searchResults.tracks} />
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

export default withRouter(TrackSearchResults);
