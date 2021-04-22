import mongoose from 'mongoose';

export const User = mongoose.model('user', mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  currentVenue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'venue'
  },
  venues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'venue'
  }]
}));