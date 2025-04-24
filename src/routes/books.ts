import express, { Router, Request, Response } from 'express';
import Book from '../models/Book';

const router: Router = express.Router();

// @route   GET /api/books/populate
// @desc    Populate database with sample books (admin/development only)
// @access  Public (should be secured in production)
router.get('/populate', async (req: Request, res: Response): Promise<void> => {
  try {
    // Real ISBNs for popular books to get actual covers from Open Library API
    const realBooks = [
      { 
        isbn: '9780061120084',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Fiction',
        description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.'
      },
      { 
        isbn: '9780451524935',
        title: '1984',
        author: 'George Orwell',
        genre: 'Science Fiction',
        description: 'A dystopian novel set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.'
      },
      { 
        isbn: '9780140283334',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        genre: 'Fiction',
        description: 'The story of a teenage boy dealing with alienation in 1950s America.'
      },
      { 
        isbn: '9780743273565',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        description: 'A novel that examines the dark side of the American Dream during the Roaring Twenties.'
      },
      { 
        isbn: '9780618640157',
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        genre: 'Fantasy',
        description: 'An epic high-fantasy novel about a quest to destroy the One Ring.'
      },
      { 
        isbn: '9780061122415',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Fiction',
        description: 'A novel about following your dreams and listening to your heart.'
      },
      { 
        isbn: '9780099448792',
        title: 'Brave New World',
        author: 'Aldous Huxley',
        genre: 'Science Fiction',
        description: 'A dystopian novel set in a futuristic World State of genetically modified citizens.'
      },
      { 
        isbn: '9780141439518',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genre: 'Romance',
        description: 'A romantic novel of manners following the character development of Elizabeth Bennet.'
      },
      { 
        isbn: '9780679783268',
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        genre: 'Fiction',
        description: 'A novel about the mental anguish and moral dilemmas of a poor ex-student in St. Petersburg.'
      },
      { 
        isbn: '9780143105428',
        title: 'The Picture of Dorian Gray',
        author: 'Oscar Wilde',
        genre: 'Fiction',
        description: 'A philosophical novel about a man who remains young while his portrait ages.'
      },
      { 
        isbn: '9780060935467',
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        genre: 'Science Fiction',
        description: 'A dystopian novel about a future American society where books are outlawed.'
      },
      { 
        isbn: '9780684801223',
        title: 'The Old Man and the Sea',
        author: 'Ernest Hemingway',
        genre: 'Fiction',
        description: 'A short novel about an aging Cuban fisherman and his struggle with a giant marlin.'
      }
    ];
    
    // Sample book data with real book information
    const sampleBooks = [
      {
        title: realBooks[0].title,
        author: realBooks[0].author,
        isbn: realBooks[0].isbn,
        genre: realBooks[0].genre,
        price: 19.99,
        quantity: 25,
        description: realBooks[0].description,
        publishDate: new Date('2023-01-01'),
        publisher: 'Penguin Books',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[0].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[1].title,
        author: realBooks[1].author,
        isbn: realBooks[1].isbn,
        genre: realBooks[1].genre,
        price: 24.99,
        quantity: 15,
        description: realBooks[1].description,
        publishDate: new Date('2023-02-15'),
        publisher: 'Signet Classics',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[1].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[2].title,
        author: realBooks[2].author,
        isbn: realBooks[2].isbn,
        genre: realBooks[2].genre,
        price: 22.50,
        quantity: 30,
        description: realBooks[2].description,
        publishDate: new Date('2023-03-20'),
        publisher: 'Little, Brown and Company',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[2].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[3].title,
        author: realBooks[3].author,
        isbn: realBooks[3].isbn,
        genre: realBooks[3].genre,
        price: 18.99,
        quantity: 20,
        description: realBooks[3].description,
        publishDate: new Date('2023-04-10'),
        publisher: 'Scribner',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[3].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[4].title,
        author: realBooks[4].author,
        isbn: realBooks[4].isbn,
        genre: realBooks[4].genre,
        price: 21.99,
        quantity: 10,
        description: realBooks[4].description,
        publishDate: new Date('2023-05-05'),
        publisher: 'Houghton Mifflin',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[4].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[5].title,
        author: realBooks[5].author,
        isbn: realBooks[5].isbn,
        genre: realBooks[5].genre,
        price: 29.99,
        quantity: 8,
        description: realBooks[5].description,
        publishDate: new Date('2023-06-30'),
        publisher: 'HarperOne',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[5].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[6].title,
        author: realBooks[6].author,
        isbn: realBooks[6].isbn,
        genre: realBooks[6].genre,
        price: 17.50,
        quantity: 22,
        description: realBooks[6].description,
        publishDate: new Date('2023-07-15'),
        publisher: 'Vintage',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[6].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[7].title,
        author: realBooks[7].author,
        isbn: realBooks[7].isbn,
        genre: realBooks[7].genre,
        price: 26.99,
        quantity: 0,
        description: realBooks[7].description,
        publishDate: new Date('2023-08-20'),
        publisher: 'Penguin Classics',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[7].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[8].title,
        author: realBooks[8].author,
        isbn: realBooks[8].isbn,
        genre: realBooks[8].genre,
        price: 23.99,
        quantity: 0,
        description: realBooks[8].description,
        publishDate: new Date('2023-09-10'),
        publisher: 'Vintage Classics',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[8].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: realBooks[9].title,
        author: realBooks[9].author,
        isbn: realBooks[9].isbn,
        genre: realBooks[9].genre,
        price: 32.99,
        quantity: 5,
        description: realBooks[9].description,
        publishDate: new Date('2023-10-05'),
        publisher: 'Penguin Classics',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[9].isbn}-L.jpg`,
        isUpcoming: false
      },
      {
        title: `Upcoming: ${realBooks[10].title} (New Edition)`,
        author: realBooks[10].author,
        isbn: realBooks[10].isbn,
        genre: realBooks[10].genre,
        price: 27.99,
        quantity: 0,
        description: `Coming Soon: ${realBooks[10].description}`,
        publishDate: new Date('2025-11-20'),
        publisher: 'Simon & Schuster',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[10].isbn}-L.jpg`,
        isUpcoming: true
      },
      {
        title: `Upcoming: ${realBooks[11].title} (Anniversary Edition)`,
        author: realBooks[11].author,
        isbn: realBooks[11].isbn,
        genre: realBooks[11].genre,
        price: 29.99,
        quantity: 0,
        description: `Coming Soon: ${realBooks[11].description}`,
        publishDate: new Date('2025-12-15'),
        publisher: 'Scribner',
        imageUrl: `https://covers.openlibrary.org/b/isbn/${realBooks[11].isbn}-L.jpg`,
        isUpcoming: true
      }
    ];

    // Clear existing books
    await Book.deleteMany({});
    
    // Insert new sample books
    await Book.insertMany(sampleBooks);
    
    res.status(200).json({ 
      message: 'Database populated with sample books successfully',
      count: sampleBooks.length
    });
  } catch (error: any) {
    console.error('Error populating books:', error);
    res.status(500).json({ message: 'Error populating books', error: error.message });
  }
});

// @route   GET /api/books
// @desc    Get all books with optional filtering
// @access  Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      minPrice,
      maxPrice,
      inStock,
      search, // for text search across multiple fields
      sort = 'title', // default sort by title
      order = 'asc', // default ascending order
      limit = 20,
      page = 1
    } = req.query;

    // Build query filter
    const filter: any = {};
    
    // Add specific field filters if provided
    if (title) filter.title = { $regex: new RegExp(String(title), 'i') };
    if (author) filter.author = { $regex: new RegExp(String(author), 'i') };
    if (isbn) filter.isbn = String(isbn);
    if (genre) filter.genre = { $regex: new RegExp(String(genre), 'i') };
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Stock availability filter
    if (inStock === 'true') filter.quantity = { $gt: 0 };
    
    // Query builder
    let query = Book.find(filter);
    
    // Text search across multiple fields if search parameter is provided
    if (search) {
      // This utilizes the text index we created in the Book model
      query = Book.find(
        { $text: { $search: String(search) } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } else {
      // Apply sorting
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortField = String(sort);
      query = query.sort({ [sortField]: sortOrder });
    }
    
    // Apply pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));
    
    // Execute query
    const books = await query.exec();
    
    // Get total count for pagination metadata
    const total = await Book.countDocuments(filter);
    
    res.json({
      books,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    res.json(book);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/books
// @desc    Create a book
// @access  Private/Admin
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      price,
      quantity,
      description,
      publishDate,
      publisher,
      imageUrl,
      isUpcoming
    } = req.body;

    const bookExists = await Book.findOne({ isbn });

    if (bookExists) {
      res.status(400).json({ message: 'Book already exists' });
      return;
    }

    const book = new Book({
      title,
      author,
      isbn,
      genre,
      price,
      quantity,
      description,
      publishDate,
      publisher,
      imageUrl,
      isUpcoming
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      price,
      quantity,
      description,
      publishDate,
      publisher,
      imageUrl,
      isUpcoming
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.isbn = isbn || book.isbn;
    book.genre = genre || book.genre;
    book.price = price || book.price;
    book.quantity = quantity !== undefined ? quantity : book.quantity;
    book.description = description || book.description;
    book.publishDate = publishDate || book.publishDate;
    book.publisher = publisher || book.publisher;
    book.imageUrl = imageUrl || book.imageUrl;
    book.isUpcoming = isUpcoming !== undefined ? isUpcoming : book.isUpcoming;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



export default router;
