import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';

// Import passport config
import './config/passport';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Connect to MongoDB
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Import routes
import booksRoutes from './routes/books';
import usersRoutes from './routes/users';
import ordersRoutes from './routes/orders';

// Use routes
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Define port
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
