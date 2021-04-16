import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { queueTrack } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './QueueTrackButton.scss';

const QueueTrackButton = (props) => {
  const { track } = props;
  const dispatch = useAppDispatch();
  const { tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleQueueSong = (track) => async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await queueTrack(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, track.uri) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await queueTrack(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken, track.uri);
    }
  };
  return (
    <FontAwesomeIcon
      className="add-to-queue"
      icon={faPlusCircle}
      onClick={handleQueueSong(track)}
      size="2x"
      title={`Add '${track.artists[0].name} - ${track.name}' to the queue.`}
    />
  );
};

export default QueueTrackButton;