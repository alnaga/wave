import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import VenueList from '../VenueList/VenueList';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueRecommendations } from '../../actions/spotify/spotifyActions';

const Recommendations = () => {
  const dispatch = useAppDispatch();
  const { recommendations, tokens } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetVenueRecommendations = async () => {
    setLoading(true);

    let result = await getVenueRecommendations(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);

    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getVenueRecommendations(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
    }

    if (!result && retries < MAX_RETRIES) {
      setRetries(retries + 1);

      await handleGetVenueRecommendations();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await handleGetVenueRecommendations();
    })();
  }, [])

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Recommendations"
      />

      <div id="recommendations">
        {
          loading
            ? (
              <div className="d-flex align-items-center justify-content-center p-3">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <>
                {
                  recommendations.length > 0
                    ? (
                      <VenueList
                        scores={recommendations.map((recommendation) => {
                          if (recommendation) {
                            return recommendation.score;
                          }
                        })}
                        venues={recommendations.map((recommendation) => {
                          if (recommendation) {
                            return recommendation.venue;
                          }
                        })}
                      />
                    ) : (
                      <div className="p-3">
                        No recommendations were found.
                      </div>
                    )
                }
              </>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default Recommendations;
