import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { queueSong } from '../../actions/spotify/spotifyActions';
import { useAppDispatch, useAppState } from '../../context/context';

import './QueueSongButton.scss';

const QueueSongButton = ({ song }) => {
  const dispatch = useAppDispatch();
  const { tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

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
  return (
    <FontAwesomeIcon
      className="add-to-queue"
      icon={faPlusCircle}
      onClick={handleQueueSong(song)}
      size="lg"
      title={`Add '${song.artists[0].name} - ${song.name}' to the queue.`}
    />
  );
};

export default QueueSongButton;