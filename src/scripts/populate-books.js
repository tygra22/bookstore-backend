const mongoose = require('mongoose');

// MongoDB connection string from project configuration
const MONGODB_URI = 'mongodb://mongo:HMteGawXDysvMBXBEXCeDKVBJuLrFyal@trolley.proxy.rlwy.net:36823/bookstore';

// MongoDB connection options
const mongooseOptions = {
  dbName: 'bookstore',  // Specify database name separately
  authSource: 'admin',  // Use admin as the auth source
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

// Sample book data with obvious naming conventions
const sampleBooks = [
  {
    title: 'Book 1',
    author: 'Author 1',
    isbn: 'ISBN-0000000001',
    genre: 'Fiction',
    price: 19.99,
    quantity: 25,
    description: 'This is the description for Book 1. It is a fictional book by Author 1.',
    publishDate: new Date('2023-01-01'),
    publisher: 'Publisher A',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+1',
    isUpcoming: false
  },
  {
    title: 'Book 2',
    author: 'Author 2',
    isbn: 'ISBN-0000000002',
    genre: 'Non-Fiction',
    price: 24.99,
    quantity: 15,
    description: 'This is the description for Book 2. It is a non-fiction book by Author 2.',
    publishDate: new Date('2023-02-15'),
    publisher: 'Publisher B',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+2',
    isUpcoming: false
  },
  {
    title: 'Book 3',
    author: 'Author 3',
    isbn: 'ISBN-0000000003',
    genre: 'Science Fiction',
    price: 22.50,
    quantity: 30,
    description: 'This is the description for Book 3. It is a sci-fi book by Author 3.',
    publishDate: new Date('2023-03-20'),
    publisher: 'Publisher C',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+3',
    isUpcoming: false
  },
  {
    title: 'Book 4',
    author: 'Author 4',
    isbn: 'ISBN-0000000004',
    genre: 'Mystery',
    price: 18.99,
    quantity: 20,
    description: 'This is the description for Book 4. It is a mystery book by Author 4.',
    publishDate: new Date('2023-04-10'),
    publisher: 'Publisher A',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+4',
    isUpcoming: false
  },
  {
    title: 'Book 5',
    author: 'Author 5',
    isbn: 'ISBN-0000000005',
    genre: 'Fantasy',
    price: 21.99,
    quantity: 10,
    description: 'This is the description for Book 5. It is a fantasy book by Author 5.',
    publishDate: new Date('2023-05-05'),
    publisher: 'Publisher B',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+5',
    isUpcoming: false
  },
  {
    title: 'Book 6',
    author: 'Author 2',
    isbn: 'ISBN-0000000006',
    genre: 'Non-Fiction',
    price: 29.99,
    quantity: 8,
    description: 'This is the description for Book 6. Another non-fiction book by Author 2.',
    publishDate: new Date('2023-06-30'),
    publisher: 'Publisher D',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+6',
    isUpcoming: false
  },
  {
    title: 'Book 7',
    author: 'Author 1',
    isbn: 'ISBN-0000000007',
    genre: 'Fiction',
    price: 17.50,
    quantity: 22,
    description: 'This is the description for Book 7. Another fiction book by Author 1.',
    publishDate: new Date('2023-07-15'),
    publisher: 'Publisher A',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+7',
    isUpcoming: false
  },
  {
    title: 'Book 8',
    author: 'Author 3',
    isbn: 'ISBN-0000000008',
    genre: 'Science Fiction',
    price: 26.99,
    quantity: 0,
    description: 'This is the description for Book 8. Another sci-fi book by Author 3 that is currently out of stock.',
    publishDate: new Date('2023-08-20'),
    publisher: 'Publisher C',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+8',
    isUpcoming: false
  },
  {
    title: 'Book 9',
    author: 'Author 4',
    isbn: 'ISBN-0000000009',
    genre: 'Mystery',
    price: 23.99,
    quantity: 0,
    description: 'This is the description for Book 9. Another mystery book by Author 4 that is currently out of stock.',
    publishDate: new Date('2023-09-10'),
    publisher: 'Publisher A',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+9',
    isUpcoming: false
  },
  {
    title: 'Book 10',
    author: 'Author 5',
    isbn: 'ISBN-0000000010',
    genre: 'Fantasy',
    price: 32.99,
    quantity: 5,
    description: 'This is the description for Book 10. Another fantasy book by Author 5.',
    publishDate: new Date('2023-10-05'),
    publisher: 'Publisher B',
    imageUrl: 'https://via.placeholder.com/300x450?text=Book+10',
    isUpcoming: false
  },
  {
    title: 'Upcoming Book 11',
    author: 'Author 1',
    isbn: 'ISBN-0000000011',
    genre: 'Fiction',
    price: 27.99,
    quantity: 0,
    description: 'This is the description for Book 11. An upcoming book by Author 1 that is not yet released.',
    publishDate: new Date('2025-11-20'),
    publisher: 'Publisher A',
    imageUrl: 'https://via.placeholder.com/300x450?text=Upcoming+Book+11',
    isUpcoming: true
  },
  {
    title: 'Upcoming Book 12',
    author: 'Author 3',
    isbn: 'ISBN-0000000012',
    genre: 'Science Fiction',
    price: 29.99,
    quantity: 0,
    description: 'This is the description for Book 12. An upcoming sci-fi book by Author 3 that is not yet released.',
    publishDate: new Date('2025-12-15'),
    publisher: 'Publisher C',
    imageUrl: 'https://via.placeholder.com/300x450?text=Upcoming+Book+12',
    isUpcoming: true
  }
];

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    try {
      // Drop existing books collection if it exists
      await mongoose.connection.db.collection('books').drop().catch(err => {
        // Collection might not exist yet, which is fine
        if (err.code !== 26) {
          console.error('Error dropping collection:', err);
        } else {
          console.log('No existing books collection to drop');
        }
      });
      
      // Insert sample books
      const result = await mongoose.connection.db.collection('books').insertMany(sampleBooks);
      console.log(`Successfully inserted ${result.insertedCount} books`);
    } catch (error) {
      console.error('Error populating books:', error);
    } finally {
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
