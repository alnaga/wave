import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { useAppState } from '../../context/context';

const Home = () => {
  const { currentVenue, tokens } = useAppState();
  
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
                                <div>
                                  To find a venue to connect to, type in a venue name in the search bar.
                                </div>

                                <div className="mt-3">
                                  {
                                    tokens.spotify.accessToken
                                      ? (
                                        <>
                                          <div className="mb-3">
                                            Or tap the button below to get a list of venues tailored to your music taste!
                                          </div>

                                          <Link to="/recommendations">
                                            <button
                                              title="Get a list of venues whose music taste is similar to your own"
                                            >
                                              Find venues most suited to me
                                            </button>
                                          </Link>
                                        </>
                                      ) : (
                                        <div>
                                          If you link your Wave account to your Spotify account, you'll be able
                                          to get suggestions for venues that most closely match your music taste!
                                          <br />
                                          <br />
                                          To connect to Spotify, click the
                                          <FontAwesomeIcon className="ml-2 mr-2" icon={faSpotify} size="lg" />
                                          icon in the navigation bar and follow the instructions to authorise Wave
                                          to use your Spotify data.
                                        </div>
                                      )
                                  }

                                </div>
                              </div>
                            ) : (
                              <div>
                                To queue a song, type in a song or artist name in the search bar and click the
                                <FontAwesomeIcon className="ml-2 mr-2" icon={faPlusCircle} size="lg" />
                                icon for the result you want to choose.
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
