import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, VOTE_DOWN, VOTE_UP } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying, getVenue, voteSong } from '../../actions/spotify/spotifyActions';

const Vote = () => {
  const dispatch = useAppDispatch();
  const { tokens, venue } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleVote = (vote) => async () => {
    if (tokensRef.current.spotify.accessToken) {
      const { skipped } = await voteSong(dispatch, tokensRef.current.spotify.accessToken, venue.uri, vote);

      if (skipped) {
        // Spotify has a short delay before skipping, so to avoid getting the same song as pre-skip, we wait.
        setTimeout(async () => {
          await getCurrentlyPlaying(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
        }, 250);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (
        tokensRef.current.spotify.accessToken
        && !venue
        && await getVenue(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken) === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokens);
        await getVenue(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
      }
    })();
  }, []);

  return (
    <>
      {
        venue
          && (
            <div id="vote" className="d-flex justify-content-between">
              <span className="pointer" onClick={handleVote(VOTE_DOWN)}>
                <FontAwesomeIcon icon={faMinusCircle} size="lg" />
              </span>

              <span>
                { venue.votes }
              </span>

              <span className="pointer" onClick={handleVote(VOTE_UP)}>
                <FontAwesomeIcon icon={faPlusCircle} size="lg" />
              </span>
            </div>
          )
      }
    </>
  );
};

export default Vote;
