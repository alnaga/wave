import React, {useEffect} from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying } from '../../actions/spotify/spotifyActions';

import Vote from '../Vote/Vote';

const CurrentlyPlaying = () => {
  const dispatch = useAppDispatch();
  const { accessToken, currentlyPlaying, device } = useAppState();

  useEffect(() => {
    (async () => {
      await getCurrentlyPlaying(dispatch, accessToken);
    })();
  }, [ , device]);

  return (
    <div>
      {
        (currentlyPlaying && currentlyPlaying.item)
          && (
            <div className="flex-column border-dark">
              <div>
                Currently Playing:
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
  )
};

export default CurrentlyPlaying;
