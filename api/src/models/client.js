import mongoose from 'mongoose';

export const Client = mongoose.model('client', mongoose.Schema({
  id: String,
  clientId: String,
  clientSecret: String,
  grants: [ String ],
  redirectUris: [ String ]
}));