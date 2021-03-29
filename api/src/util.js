import { MongoClient } from 'mongodb';

export const useMongoClient = () => {
  return new MongoClient('mongodb://localhost:8082', {
    useUnifiedTopology: true
  });
};