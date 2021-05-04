import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

import './VenueList.scss';

const VenueList = (props) => {
  const { scores, venues } = props;

  const [ maxScore, setMaxScore ] = useState(1);

  useEffect(() => {
    if (scores) {
      setMaxScore(Math.max.apply(Math, scores));
    }
  }, [scores]);

  return (
    <div id="venue-list">
      {
        venues.map((venue, index) => {
          let matchPercentage = undefined;
          if (scores && scores[index]) {
            matchPercentage = (scores[index] / 300) * 100;
            if (matchPercentage % 1 !== 0) {
              matchPercentage = matchPercentage.toFixed(1);
            }
          }

          if (venue) {
            return (
              <Link
                to={`/venue/${venue._id}`}
                className="result"
                key={venue._id}
                title={`Go to ${venue.name}'s page`}
              >
                <div className="venue-name">
                  { venue.name }
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  {
                    (scores && matchPercentage !== undefined && matchPercentage !== null)
                    && (
                      <div className="venue-score ml-3 mr-3">
                        Match: {matchPercentage}%
                      </div>
                    )
                  }

                  <FontAwesomeIcon icon={faArrowCircleRight} size="lg" />
                </div>


              </Link>
            );
          }
        })
      }
    </div>
  );
};

export default VenueList;
