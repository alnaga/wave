import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { refreshExpiredTokens } from '../../util';
import { TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { checkIn, checkOut, getVenueData } from '../../actions/venue/venueActions';

import './VenueInfo.scss';

const VenueInfo = (props) => {
  const dispatch = useAppDispatch();
  const { currentVenue, tokens, venueInfo } = useAppState();
  
  const tokensRef = useRef(null);
  tokensRef.current = tokens;

  const displayAddress = () => {
    let output = [];

    for (let field in venueInfo.address) {
      output.push(venueInfo.address[field]);
    }

    return output;
  };

  const handleCheckIn = async () => {
    if (
      tokensRef.current.wave.accessToken
      && await checkIn(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await checkIn(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId);
    }

    await handleGetVenueInfo();
  };

  const handleCheckOut = async () => {
    if (
      tokensRef.current.wave.accessToken
      && await checkOut(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await checkOut(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId);
    }

    await handleGetVenueInfo();
  };

  const handleGetVenueInfo = async () => {
    if (
      tokensRef.current.wave.accessToken
      && await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId)
    }
  };

  useEffect(() => {
    (async () => {
      await handleGetVenueInfo();
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
                      <div className="mb-3">
                        <a href={venueInfo.googleMapsLink} target="_blank"> Google Maps Link </a>
                      </div>
                    )
                  }

                  <div className="mb-3">
                    <label> Checked In Users </label>

                    {
                      venueInfo.attendees.length > 0
                        ? (
                          <div className="list mt-1">
                            {
                              venueInfo.attendees.map((attendee) => {
                                return (
                                  <div className="list-item" key={attendee.username}>
                                    { attendee.username }
                                  </div>
                                )
                              })
                            }
                          </div>
                        ) : (
                          <div id="no-attendees">
                            No users have currently checked into this venue. Why not be the first to start playing?
                          </div>
                        )
                    }
                  </div>

                  {
                    (venueInfo.attendees.length > 0 && venueInfo.attendees.find((attendee) => attendee.username === tokensRef.current.wave.user.username))
                      ? (
                        <button
                          onClick={handleCheckOut}
                        >
                          Check Out
                        </button>
                      ) : (
                        <button
                          onClick={handleCheckIn}
                        >
                          Check In
                        </button>
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
