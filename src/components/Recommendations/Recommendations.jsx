import React, { useEffect, useRef, useState } from 'react';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import VenueList from '../VenueList/VenueList';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueRecommendations } from '../../actions/spotify/spotifyActions';

const Recommendations = () => {
  const dispatch = useAppDispatch();
  const { recommendations, tokens } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const handleGetVenueRecommendations = async () => {
    if (
      tokensRef.current.wave.accessToken
      && tokensRef.current.spotify.accessToken
      && await getVenueRecommendations(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getVenueRecommendations(dispatch, tokensRef.current.wave.accessToken, tokensRef.current.spotify.accessToken);
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
          recommendations.length > 0
            ? (
              <VenueList
                scores={recommendations.map((recommendation) => recommendation.score)}
                venues={recommendations.map((recommendation) => recommendation.venue)}
              />
            ) : (
              <div className="p-3">
                No recommendations were found.
              </div>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default Recommendations;
