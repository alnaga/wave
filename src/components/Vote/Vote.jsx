import React from 'react';

import { VOTE_DOWN, VOTE_UP } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying, voteSong } from '../../actions/spotify/spotifyActions';

const Vote = () => {
  const dispatch = useAppDispatch();
  const { accessToken, venue } = useAppState();

  const handleVote = (vote) => async () => {
    if (await voteSong(dispatch, accessToken, venue.uri, vote) === 2) {
      await getCurrentlyPlaying(dispatch, accessToken);
    }
  };

  return (
    <>
      {
        venue
          && (
            <div className="flex">
              <button onClick={handleVote(VOTE_UP)}> + </button>

              <span>
                { venue.votes }
              </span>

              <button onClick={handleVote(VOTE_DOWN)}> - </button>
            </div>
          )
      }
    </>
  );
};

export default Vote;
