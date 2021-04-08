import React, {useEffect} from 'react';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentlyPlaying } from '../../actions/spotify/spotifyActions';

const CurrentlyPlaying = () => {
  const dispatch = useAppDispatch();
  const { accessToken, currentlyPlaying } = useAppState();

  useEffect(() => {
    getCurrentlyPlaying(dispatch, accessToken);
  }, []);

  return (
    <div>
      {
        currentlyPlaying
          && (
            <div className="flex-column">
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
            </div>
          )
      }
    </div>
  )
};

export default CurrentlyPlaying;
