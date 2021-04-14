import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens} from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { getSongSearchResults, queueSong } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

const SearchResults = (props) => {
  const dispatch = useAppDispatch();
  const { searchResults, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  // TODO: Implement fetching songs from subsequent pages if there are enough results.

  const calculateRuntime = (duration) => {
    const minutes = Math.floor(duration / 60000);
    let seconds = ((duration % 60000) / 1000).toFixed(0);
    if (seconds < 10) seconds = '0' + seconds;
    return `${minutes}:${seconds}`;
  };

  const handleQueueSong = (song) => async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await queueSong(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, song.uri) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await queueSong(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, song.uri);
    }
  };

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
    <div id="search-results">
      <div id="search-results-title" className="d-flex flex-column align-items-center p-3">
        Showing results for '{ decodeURIComponent(props.match.params.query) }':
      </div>

      {
        searchResults.length > 0
          ? (
            <table>
              <thead className="mb-3">
              <tr>
                <td> Album </td>
                <td> Artist </td>
                <td> Song </td>
                <td> Runtime </td>
              </tr>
              </thead>

              <tbody>
                {
                  searchResults.map((result) => {
                    return (
                      <tr key={result.id} className="search-result">
                        <td> <img src={result.album.images[2].url} width={64} title={result.album.name} />  </td>
                        <td title={result.artists[0].name}> { result.artists[0].name } </td>
                        <td title={result.name}> { result.name } </td>
                        <td className="text-right"> {calculateRuntime(result.duration_ms)} </td>
                        <td className="text-center">
                          <FontAwesomeIcon
                            className="add-to-queue"
                            icon={faPlusCircle}
                            onClick={handleQueueSong(result)}
                            size="lg"
                            title={`Add '${result.artists[0].name} - ${result.name}' to the queue.`}
                          />
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>

            </table>
          ) : (
            <div className="p-3">
              No songs, albums or artists matched your search.
            </div>
          )
      }
    </div>
  );
};

export default withRouter(SearchResults);
