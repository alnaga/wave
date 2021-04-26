import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { useAppState } from '../../context/context';

const Home = () => {
  const { currentVenue, tokens } = useAppState();
  
  console.log(tokens)

  return (
    <ScreenContainer>
      <ScreenHeader title="Welcome to Wave!" />

      <div id="home" className="p-3">
        {
          !tokens.wave.accessToken
            ? (
              <>
                To get started, please click the
                <FontAwesomeIcon className="ml-2 mr-2" icon={faUserCircle} size="lg" />
                icon in the navigation bar to log in or register.
              </>
            )
            : (
              <>
                {
                  !tokens.spotify.accessToken
                    ? (
                      <div>
                        To get the most out of Wave, please click the
                        <FontAwesomeIcon className="ml-2 mr-2" icon={faSpotify} size="lg" />
                        icon in the navigation bar.
                        <br />
                        This will allow us to find the venues that are most suited to your music taste!
                      </div>
                    ) : (
                      <>
                        {
                          !currentVenue
                            ? (
                              <div>
                                To find a venue to connect to, type in a venue name in the search bar.
                              </div>
                            ) : (
                              <div>
                                To queue a song, type in a song or artist name in the search bar and click the
                                <FontAwesomeIcon
                                  className="add-to-queue"
                                  icon={faPlusCircle}
                                  size="2x"
                                />
                              </div>
                            )
                        }
                      </>
                    )
                }
              </>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default Home;
