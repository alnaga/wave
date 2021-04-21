import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getVenueData } from '../../actions/venue/venueActions';

import './VenueInfo.scss';

const VenueInfo = (props) => {
  const dispatch = useAppDispatch();
  const { tokens, venueInfo } = useAppState();

  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const displayAddress = () => {
    let output = [];

    for (let field in venueInfo.address) {
      output.push(venueInfo.address[field]);
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
      <div id="venue-info">
        {
          venueInfo
            && (
              <>
                <ScreenHeader title={venueInfo.name} />

                <div className="p-3">
                  <div className="mb-3">
                    <label> Address </label>

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
                    venueInfo.googleMapsLink
                    && (
                      <div>
                        <a href={venueInfo.googleMapsLink} target="_blank"> Google Maps Link </a>
                      </div>
                    )
                  }
                </div>
              </>
            )
        }
      </div>
    </ScreenContainer>
  );
};

export default withRouter(VenueInfo);
