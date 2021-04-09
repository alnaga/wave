import React, {useEffect} from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying } from '../../actions/spotify/spotifyActions';

import Vote from '../Vote/Vote';

const CurrentlyPlaying = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyPlaying,
    devices,
    tokens
  } = useAppState();
  const { spotify } = tokens;

  useEffect(() => {
    (async () => {
      await getCurrentlyPlaying(dispatch, spotify.accessToken);
    })();
  }, [ , devices]);

  return (
    <div>
      {
        (currentlyPlaying && currentlyPlaying.item)
          && (
            <div className="flex-column border-dark">
              <div>
                Currently Playing on { devices[0].name }:
              </div>

              <div>
                {
                  currentlyPlaying.item.artists[0].name
                }
                {' '} - {' '}
                {
                  currentlyPlaying.item.name
                }
              </div>

              <Vote />
            </div>
          )
      }
    </div>
  );
};

export default CurrentlyPlaying;
