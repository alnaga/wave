import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import Error from '../Error/Error';
import ScreenContainer from '../ScreenContainer/ScreenContainer';
import ScreenHeader from '../ScreenHeader/ScreenHeader';

import { refreshExpiredTokens } from '../../util';
import { MAX_RETRIES, TOKENS_EXPIRED } from '../../constants';
import { useAppDispatch, useAppState } from '../../context/context';
import { getCurrentSong } from '../../actions/spotify/spotifyActions';
import { checkIn, checkOut, deleteVenue, getVenueData, updateVenueDetails } from '../../actions/venue/venueActions';

import './VenueInfo.scss';

const VenueInfo = (props) => {
  const dispatch = useAppDispatch();
  const { tokens, venueInfo } = useAppState();

  const [ loading, setLoading ] = useState(false);
  const [ retries, setRetries ] = useState(0);

  const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState(false);

  const [ dataChanged, setDataChanged ] = useState(false);

  const [ editData, setEditData ] = useState({
    name: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    googleMapsLink: ''
  });
  const [ editMode, setEditMode ] = useState(false);

  const retriesRef = useRef(null);
  retriesRef.current = retries;

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

    await getCurrentSong(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId);
    await handleGetVenueInfo();
  };

  const handleCheckOut = async (override = false) => {
    if (
      tokensRef.current.wave.accessToken
      && await checkOut(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId, override) === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      await checkOut(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId, override);
    }

    await handleGetVenueInfo();
  };

  const handleDeleteVenue = async () => {
    let result = await deleteVenue(dispatch, tokensRef.current.wave.accessToken, venueInfo.id);

    if (
      tokensRef.current.wave.accessToken
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await updateVenueDetails(dispatch, tokensRef.current.wave.accessToken, venueInfo.id);
    }

    if (result === 1) {
      props.history.goBack();
    }
  };

  const handleEditField = (field) => (event) => {
    let value;

    if (!dataChanged) {
      setDataChanged(true);
    }

    if (field === 'spotifyConsent') {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }

    setEditData((prevState) => ({
      ...prevState,
      [field]: value
    }));
  };
  
  const handleGetVenueInfo = async () => {
    setLoading(true);

    let result = await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId);

    if (
      tokensRef.current.wave.accessToken
      && result === TOKENS_EXPIRED
    ) {
      await refreshExpiredTokens(dispatch, tokensRef.current);
      result = await getVenueData(dispatch, tokensRef.current.wave.accessToken, props.match.params.venueId)
    }

    if (!result && retriesRef.current + 1 < MAX_RETRIES) {
      setRetries(retriesRef.current + 1);

      await handleGetVenueInfo();
    } else {
      setLoading(false);
    }
  };

  const handleToggleEditMode = async () => {
    setEditMode(!editMode);
  };

  const handleToggleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(!showDeleteConfirmation);
  };
  
  const handleUpdateVenueDetails = async () => {
    if (!dataChanged) {
      setEditMode(false);
    } else {
      if (
        tokensRef.current.wave.accessToken
        && await updateVenueDetails(dispatch, tokensRef.current.wave.accessToken, venueInfo.id, editData) === TOKENS_EXPIRED
      ) {
        await refreshExpiredTokens(dispatch, tokensRef.current);
        await updateVenueDetails(dispatch, tokensRef.current.wave.accessToken, venueInfo.id, editData);
      }

      setEditMode(false);
      await handleGetVenueInfo();
    }
  };

  useEffect(() => {
    if (venueInfo && venueInfo.name && !dataChanged) {
      setEditData({
        name: venueInfo.name,
        description: venueInfo.description,
        addressLine1: venueInfo.address.addressLine1,
        addressLine2: venueInfo.address.addressLine2,
        city: venueInfo.address.city,
        county: venueInfo.address.county,
        postcode: venueInfo.address.postcode,
        googleMapsLink: venueInfo.googleMapsLink
      });
    }
  }, [venueInfo])

  useEffect(() => {
    (async () => {
      await handleGetVenueInfo();
    })();
  }, []);

  return (
    <ScreenContainer>
      <div id="venue-info">
        {
          loading
            ? (
              <div className="d-flex align-items-center justify-content-center p-3">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <>
                {
                  (venueInfo && venueInfo.name)
                  && (
                    <>
                      <ScreenHeader
                        title={editMode ? 'Update Venue Details' : venueInfo.name}
                      />

                      <div className="p-3">
                        {
                          // If the user is an owner of the venue, display the button to enable/disable edit mode so they can make changes.
                          (
                            tokens.wave.user.username
                            && venueInfo.owners.find((owner) => owner.username === tokens.wave.user.username)
                            && !venueInfo.outputDeviceId
                          )
                          && (
                            <Error
                              className="mb-3"
                              dismissible={false}
                              message="In order to queue songs, you must select an output device. Please check into this venue and then click the headphone icon in the status bar to select a device."
                              show={true}
                            />
                          )
                        }

                        {
                          editMode
                          && (
                            <div className="mb-3 d-flex flex-column">
                              <label> Venue Name * </label>

                              <input
                                name="venue-name"
                                className="mt-1"
                                onChange={handleEditField('name')}
                                placeholder="Venue Name"
                                value={editData.name}
                              />
                            </div>
                          )
                        }

                        <div className="mb-3 d-flex justify-content-between">
                          <div>
                            <label> Owner(s) </label>
                            {
                              venueInfo.owners.map((owner) => {
                                return (
                                  <div key={owner.username}>
                                    { owner.firstName } { owner.lastName }
                                  </div>
                                );
                              })
                            }
                          </div>

                          {
                            // If the user is an owner of the venue, display the button to enable/disable edit mode so they can make changes.
                            (tokens.wave.user.username && venueInfo.owners.find((owner) => owner.username === tokens.wave.user.username))
                            && (
                              <div className="ui-button" onClick={handleToggleEditMode} title="Edit venue details">
                                <FontAwesomeIcon icon={faEdit} />
                              </div>
                            )
                          }

                        </div>

                        <div className="mb-3 d-flex flex-column">
                          <label> Description {editMode && '*'} </label>
                          {
                            editMode
                              ? (
                                <textarea
                                  name="venue-description"
                                  className="mt-1"
                                  onChange={handleEditField('description')}
                                  placeholder="Description"
                                  value={editData.description}
                                />
                              ) : (
                                <div>
                                  { venueInfo.description }
                                </div>
                              )
                          }
                        </div>

                        <div className="mb-3 d-flex flex-column">
                          <label> Address {editMode && '*'} </label>

                          {
                            editMode
                              ? (
                                <>
                                  <input
                                    className="mb-2 mt-1"
                                    name="address-line-1"
                                    onChange={handleEditField('addressLine1')}
                                    placeholder="Address Line 1 *"
                                    required
                                    value={editData.addressLine1}
                                  />
                                  <input
                                    className="mb-2"
                                    name="address-line-2"
                                    onChange={handleEditField('addressLine2')}
                                    placeholder="Address Line 2"
                                    value={editData.addressLine2}
                                  />

                                  <input
                                    className="mb-2"
                                    name="city"
                                    onChange={handleEditField('city')}
                                    placeholder="City *"
                                    required
                                    value={editData.city}
                                  />

                                  <input
                                    className="mb-2"
                                    name="county"
                                    onChange={handleEditField('county')}
                                    placeholder="County *"
                                    required
                                    value={editData.county}
                                  />

                                  <input
                                    name="postcode"
                                    onChange={handleEditField('postcode')}
                                    placeholder="Postcode *"
                                    required
                                    value={editData.postcode}
                                  />
                                </>
                              ) : (
                                <>
                                  {
                                    displayAddress().map((line, index) => {
                                      return (
                                        <div key={index}>
                                          { line }
                                        </div>
                                      );
                                    })
                                  }
                                </>
                              )
                          }
                        </div>

                        {
                          editMode
                            ? (
                              <div className="mb-3 d-flex flex-column">
                                <label> Google Maps Link </label>

                                <input
                                  className="mb-2 mt-1"
                                  name="google-maps-link"
                                  onChange={handleEditField('googleMapsLink')}
                                  placeholder="Google Maps Link"
                                  required
                                  value={editData.googleMapsLink}
                                />
                              </div>
                            ) : (
                              <>
                                {
                                  venueInfo.googleMapsLink
                                  && (
                                    <div className="mb-3">
                                      <a href={venueInfo.googleMapsLink} target="_blank"> Google Maps Link </a>
                                    </div>
                                  )
                                }
                              </>
                            )
                        }

                        {
                          !editMode
                          && (
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
                                      No users are currently checked in at this venue. Why not be the first to start playing?
                                    </div>
                                  )
                              }
                            </div>
                          )
                        }

                        {
                          editMode
                            ? (
                              <>
                                <button onClick={handleUpdateVenueDetails}>
                                  {
                                    dataChanged
                                      ? (
                                        'Save Changes'
                                      ) : (
                                        'Cancel'
                                      )
                                  }
                                </button>

                                <button className="mt-3" onClick={showDeleteConfirmation ? handleDeleteVenue : handleToggleShowDeleteConfirmation}>
                                  {
                                    showDeleteConfirmation
                                      ? 'Confirm Venue Deletion'
                                      : 'Delete Venue'
                                  }
                                </button>
                              </>
                            ) : (
                              <>
                                {
                                  (venueInfo.attendees.length > 0 && venueInfo.attendees.find((attendee) => attendee.username === tokensRef.current.wave.user.username))
                                    ? (
                                      <button onClick={handleCheckOut}>
                                        Check Out
                                      </button>
                                    ) : (
                                      <button onClick={handleCheckIn}>
                                        Check In
                                      </button>
                                    )
                                }
                              </>
                            )
                        }
                      </div>
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

export default withRouter(VenueInfo);
