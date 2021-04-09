import mongoose from 'mongoose';

export const User = mongoose.model('user', mongoose.Schema({
  username: String,
  password: String
}));