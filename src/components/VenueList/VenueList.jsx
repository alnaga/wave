import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

import './VenueList.scss';

const VenueList = (props) => {
  const { venues } = props;

  return (
    <div id="venue-list">
      {
        venues.map((venue) => {
          return (
            <Link
              to={`/venue/${venue._id}`}
              className="result"
              key={venue._id}
              title={`Go to ${venue.name}'s page`}
            >
              <div>
                { venue.name }
              </div>

              <FontAwesomeIcon icon={faArrowCircleRight} size="lg" />
            </Link>
          );
        })
      }
    </div>
  );
};

export default VenueList;
