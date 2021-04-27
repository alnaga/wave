import mongoose from 'mongoose';

export const Venue = mongoose.model('venue', mongoose.Schema({
  address: Object,
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  currentSong: String,
  description: String,
  googleMapsLink: String,
  name: String,
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  uri: String,
  spotifyConsent: Boolean,
  spotifyTokens: Object,
  votes: Number
}));