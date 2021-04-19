import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueData } from '../../actions/venue/venueActions';
import ScreenContainer from '../ScreenContainer/ScreenContainer';

const VenueInfo = (props) => {
  const dispatch = useAppDispatch();
  const { tokens, venue } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const displayAddress = () => {
    let output = [];

    for (let field in venue.address) {
      output.push(venue.address[field]);
    }

    return output;
  };

  useEffect(() => {
    (async () => {
      if (
        tokensRef.current.wave.accessToken
        && await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId) === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokensRef.current);
        await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId)
      }
    })();
  }, []);

  return (
    <ScreenContainer>
      <div className="p-3">
        Venue Information

        <div>
          {
            venue
            && (
              <div>
                <div>
                  { venue.name }
                </div>

                <div>
                  {
                    displayAddress().map((line, index) => {
                      return (
                        <div key={index}>
                          { line }
                        </div>
                      );
                    })
                  }
                </div>

                {
                  venue.googleMapsLink
                    && (
                      <div>
                        { venue.googleMapsLink }
                      </div>
                    )
                }
              </div>
            )
          }
        </div>
      </div>
    </ScreenContainer>
  );
};

export default withRouter(VenueInfo);
