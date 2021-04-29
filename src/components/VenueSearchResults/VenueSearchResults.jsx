import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import VenueList from '../VenueList/VenueList';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueSearchResults } from '../../actions/venue/venueActions';

const VenueSearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { searchResults, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleVenueSearch = async () => {
    setLoading(true);

    const query = decodeURIComponent(props.match.params.query);

    let result = await getVenueSearchResults(dispatch, tokensRef.current.wave.accessToken, query);
    if (
      tokensRef.current.wave.accessToken
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getVenueSearchResults(dispatch, tokensRef.current.wave.accessToken, query);
    }

    if (!result && retries < MAX_RETRIES) {
      setRetries(retries + 1);

      await handleVenueSearch();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (props.match.params.query) {
        await handleVenueSearch();
      }
    })();

  }, [ , props.match.params.query]);

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Venue Search Results"
        subtitle={`Showing results for '${decodeURIComponent(props.match.params.query)}':`}
      />

      {
        loading
          ? (
            <div className="d-flex align-items-center justify-content-center p-3">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
              {
                searchResults.venues.length > 0
                  ? (
                    <VenueList venues={searchResults.venues} />
                  ) : (
                    <div className="p-3 text-center">
                      No venues matched your search.
                    </div>
                  )
              }
            </>
          )
      }
    </ScreenContainer>
  )
};

export default withRouter(VenueSearchResults);
