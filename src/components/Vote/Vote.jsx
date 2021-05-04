import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED, VOTE_DOWN, VOTE_UP} from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentSong } from '../../actions/spotify/spotifyActions';
import { voteSong } from '../../actions/venue/venueActions';

import './Vote.scss';

const Vote = () => {
  const dispatch = useAppDispatch();
  const { currentSong, currentVenue, tokens } = useAppState();

  const [ previousSong, setPreviousSong ] = useState({});
  const [ voteType, setVoteType ] = useState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleVote = (vote) => async () => {
    if (!voteType && tokensRef.current.wave.accessToken) {
      setVoteType(vote);
      const firstVoteAttempt = await voteSong(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, vote);
      let { skipped } = firstVoteAttempt;

      if (
        tokensRef.current.wave.accessToken
        && firstVoteAttempt === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokensRef.current);
        skipped = await voteSong(dispatch, tokensRef.current.wave.accessToken, currentVenue.id, vote).skipped;
      }

      if (skipped) {
        // Spotify has a short delay before skipping, so to avoid getting the same song as pre-skip, we wait.
        setTimeout(async () => {
          await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, currentVenue.id);
        }, 250);
      }
    }
  };

  useEffect(() => {
    if (currentSong && currentSong.item.id !== previousSong) {
      setVoteType(undefined);
      setPreviousSong(currentSong.item.id);
    }
  }, [currentSong]);

  return (
    <>
      {
        (currentVenue && currentSong)
          && (
            <div id="vote">
              <span
                className={classNames({
                  'vote-button': true,
                  'disabled': voteType === VOTE_UP,
                  'selected': voteType === VOTE_DOWN
                })}
                onClick={handleVote(VOTE_DOWN)}
              >
                <FontAwesomeIcon icon={faThumbsDown} />
              </span>

              <span className="vote-count">
                { currentVenue.votes }
              </span>

              <span
                className={classNames({
                  'vote-button': true,
                  'disabled': voteType === VOTE_DOWN,
                  'selected': voteType === VOTE_UP
                })}
                onClick={handleVote(VOTE_UP)}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </span>
            </div>
          )
      }
    </>
  );
};

export default Vote;
