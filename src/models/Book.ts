import mongoose, { Document, Schema } from 'mongoose';

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
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
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
    trim: true
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

// Create and export the Book model
export default mongoose.model<IBook>('Book', BookSchema);
