import { Router } from 'express';
import { User } from '../models/user';
import { Venue } from '../models/venue';

import { authenticate } from '../util';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const { id } = req.query;

  await Venue.findOne({ _id: id }, (error, venue) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error occurred while fetching venue data.'
      });
    } else if (venue) {
      res.status(200).send({
        venue: {
          _id: venue._id,
          address: venue.address,
          googleMapsLink: venue.googleMapsLink,
          name: venue.name,
          songHistory: venue.songHistory
        }
      });
    } else {
      res.status(400).send({
        message: 'Invalid venue.'
      });
    }
  });
});

router.post('/', authenticate, async (req, res) => {
  const {
    addressLine1,
    addressLine2,
    city,
    county,
    spotifyConsent,
    googleMapsLink,
    name,
    ownerUsername,
    postcode,
    spotifyTokens
  } = req.body;

  const address = {
    addressLine1,
    addressLine2,
    city,
    county,
    postcode
  }

  await User.findOne({
    username: ownerUsername
  }, async (error, user) => {
    if (error) {
      res.status(500).send({
        message: 'Internal server error during business registration.'
      });
    } else {
      const newVenue = new Venue({
        address,
        googleMapsLink,
        name,
        owners: [ user._id ],
        spotifyConsent,
        spotifyTokens
      });

      await newVenue.save(async (error, venue) => {
        if (error) {
          res.status(500).send({
            message: 'Internal server error during business registration.'
          });
        } else {
          await User.updateOne({ _id: user._id }, {
            $push: {
              venues: venue._id
            }
          });

          console.log('New Venue:', venue);

          res.status(200).send({
            venue: {
              _id: venue._id,
              address: venue.address,
              googleMapsLink: venue.googleMapsLink,
              name: venue.name,
              owners: [ user ],
              songHistory: venue.songHistory
            },
            message: 'Business registration successful!'
          });
        }
      });
    }
  });
});

router.post('/check-in', authenticate, async (req, res) => {

});

module.exports = router;
