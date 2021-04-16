import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import SongTable from '../SongTable/SongTable';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { getSongSearchResults } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './SearchResults.scss';

const SearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { searchResults, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  // TODO: Implement fetching songs from subsequent pages if there are enough results.

  const handleSearch = async () => {
    const query = decodeURIComponent(props.match.params.query);
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await getSongSearchResults(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, query) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getSongSearchResults(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, query);
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
      <div className="d-flex flex-column align-items-center p-3">
        Showing results for '{ decodeURIComponent(props.match.params.query) }':
      </div>

      {
        searchResults.length > 0
          ? (
            <SongTable items={searchResults} />
          ) : (
            <div className="p-3">
              No songs, albums or artists matched your search.
            </div>
          )
      }
    </ScreenContainer>
  );
};

export default withRouter(SearchResults);
