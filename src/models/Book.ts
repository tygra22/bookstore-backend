import mongoose, { Document, Schema, Query } from 'mongoose';

// Define the interface for a Book document
export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  price: number;
  quantity: number;
  description?: string;
  publishDate?: Date;
  publisher?: string;
  imageUrl?: string;
  isUpcoming: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Book schema
const BookSchema: Schema = new Schema({
  // Adding explicit indexes for fields that will be frequently searched
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for faster title searches
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for faster author searches
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    index: true // Index for faster genre searches
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  publishDate: {
    type: Date
  },
  publisher: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isUpcoming: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
BookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound indexes for common search combinations
BookSchema.index({ title: 1, author: 1 }); // For searches that combine title and author
BookSchema.index({ genre: 1, price: 1 }); // For filtered searches by genre and price range

// Create text index for full-text search capabilities
BookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Create and export the Book model
export default mongoose.model<IBook>('Book', BookSchema);
