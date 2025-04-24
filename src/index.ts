import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

// Import passport config
import './config/passport';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

app.use(cors({
  origin: '*',  // Allow all origins for troubleshooting
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB using Railway variables
let MONGODB_URI: string;

// Print all available environment variables for debugging (without values)
console.log('Available environment variables:', Object.keys(process.env));

// Check for various Railway MongoDB connection options
if (process.env.MONGO_URL) {
  MONGODB_URI = process.env.MONGO_URL; // Internal Railway MongoDB URL
  console.log('Using MONGO_URL environment variable');
} else if (process.env.MONGO_PUBLIC_URL) {
  MONGODB_URI = process.env.MONGO_PUBLIC_URL; // Public Railway MongoDB URL
  console.log('Using MONGO_PUBLIC_URL environment variable');
} else if (process.env.MONGOUSER && process.env.MONGOPASSWORD && process.env.MONGOHOST && process.env.MONGOPORT) {
  // Construct connection string from parts
  MONGODB_URI = `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}:${process.env.MONGOPORT}`;
  console.log('Using constructed MongoDB connection string from environment variables');
} else {
  // Fallback to local development
  MONGODB_URI = 'mongodb://localhost:27017';
  console.log('No MongoDB environment variables found, using local development connection');
}

// Log connection string (but hide credentials)
const logUri = MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@');
console.log(`Attempting to connect to MongoDB: ${logUri}`);

// MongoDB connection options with auth source and database name
const mongooseOptions = {
  dbName: 'bookstore',  // Specify database name separately
  authSource: 'admin',  // Use admin as the auth source
  // More robust connection settings
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

// Try to connect with robust error handling
const connectWithRetry = async (attempt = 1, maxAttempts = 5) => {
  try {
    console.log(`MongoDB connection attempt ${attempt}/${maxAttempts}...`);
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB successfully!');
  } catch (err) {
    console.error(`MongoDB connection attempt ${attempt} failed:`, err);

    if (attempt < maxAttempts) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff with max 10s
      console.log(`Retrying in ${delay / 1000} seconds...`);
      setTimeout(() => connectWithRetry(attempt + 1, maxAttempts), delay);
    } else {
      console.error('All MongoDB connection attempts failed. Starting server anyway...');
      // Print detailed connection info for debugging
      if (process.env.MONGO_URL) console.log('MONGO_URL available:', !!process.env.MONGO_URL);
      if (process.env.MONGO_PUBLIC_URL) console.log('MONGO_PUBLIC_URL available:', !!process.env.MONGO_PUBLIC_URL);
    }
  }
};

// Attempt to connect to MongoDB
connectWithRetry();

// Import routes
import adminRoutes from './routes/admin';
import booksRoutes from './routes/books';
import ordersRoutes from './routes/orders';
import usersRoutes from './routes/users';

// Use routes
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Add a health check endpoint for Docker
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// API only - no frontend serving in this deployment
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Endpoint not found',
    note: 'This is a backend-only API server. Frontend is deployed separately.'
  });
});

// Define port
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
