import mongoose from 'mongoose';
import { config } from './env.js';

export let isMongoConnected = false;

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✓ Successfully connected to MongoDB Atlas');
  } catch (error) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection could not be established:', (error as Error).message);
    console.warn('ℹ️ Running in resilient mode. Set MONGODB_URI in environment for persistent Atlas storage.');
  }
}
