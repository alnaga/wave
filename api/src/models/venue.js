import mongoose from 'mongoose';

export const Venue = mongoose.model('venue', mongoose.Schema({
  address: Object,
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  description: String,
  googleMapsLink: String,
  name: String,
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  uri: String,
  songHistory: [ Object ],
  spotifyConsent: Boolean,
  spotifyTokens: Object,
  votes: Number
}));