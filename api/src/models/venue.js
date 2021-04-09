import mongoose from 'mongoose';

export const Venue = mongoose.model('venue', mongoose.Schema({
  attendees: Number,
  name: String,
  uri: String,
  votes: Number
}));