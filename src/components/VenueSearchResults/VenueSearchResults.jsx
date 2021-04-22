import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import VenueList from '../VenueList/VenueList';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueSearchResults } from '../../actions/venue/venueActions';

const VenueSearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { searchResults, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleVenueSearch = async () => {
    const query = decodeURIComponent(props.match.params.query);
    if (
      tokensRef.current.wave.accessToken
      && await getVenueSearchResults(dispatch, tokensRef.current.wave.accessToken, query) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getVenueSearchResults(dispatch, tokensRef.current.wave.accessToken, query);
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
        searchResults.venues.length > 0
          ? (
            <VenueList venues={searchResults.venues} />
          ) : (
            <div className="p-3 text-center">
              No venues matched your search.
            </div>
          )
      }
    </ScreenContainer>
  )
};

export default withRouter(VenueSearchResults);
