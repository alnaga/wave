import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { VOTE_DOWN, VOTE_UP } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying, voteSong } from '../../actions/spotify/spotifyActions';

const Vote = () => {
  const dispatch = useAppDispatch();
  const { tokens, venue } = useAppState();
  const { spotify } = tokens;

  const handleVote = (vote) => async () => {
    if (spotify.accessToken) {
      const { skipped } = await voteSong(dispatch, spotify.accessToken, venue.uri, vote);
      if (skipped) {
        // Spotify has a short delay before skipping, so to avoid getting the same song pre-skip, we wait.
        setTimeout(async () => {
          await getCurrentlyPlaying(dispatch, spotify.accessToken);
        }, 250);
      }
    }
  };

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
