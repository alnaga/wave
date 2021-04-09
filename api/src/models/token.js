import mongoose from 'mongoose';

export const Token = mongoose.model('token', mongoose.Schema({
  accessToken: String,
  accessTokenExpiresAt: Date,
  refreshToken: String,
  refreshTokenExpiresAt: Date,
  client: Object,
  user: Object
}).index({ refreshTokenExpiresAt: 1 }, { expireAfterSeconds: 0 }));