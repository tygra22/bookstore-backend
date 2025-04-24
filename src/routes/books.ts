import express, { Router, Request, Response } from 'express';
import Book from '../models/Book';

const router: Router = express.Router();

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.find({});
    res.json(books);
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
