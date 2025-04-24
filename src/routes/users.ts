import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { localAuth, requireAdmin, requireAuth } from '../middleware/auth';
import User, { IUser } from '../models/User';

const router: Router = express.Router();

// Helper function to generate a token
const generateToken = (id: string): string => {
  // Hard-coded JWT secret for Railway deployment
  // NOTE: This is NOT best practice and should be temporary
  const secret = 'HMteGawXDysvMBXBEXCeDKVBJuLrFyal';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password, address, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    const user: IUser = await User.create({
      name,
      email,
      password,
      address,
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], localAuth, (req: Request, res: Response): void => {
  // Validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // User is already authenticated by localAuth middleware
  const user = req.user as IUser & Document;

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id.toString())
  });
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', requireAuth, (req: Request, res: Response): void => {
  try {
    // User is already attached to req by requireAuth middleware
    const user = req.user as IUser & Document;

    // Don't send the password back to the client
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode,
      phone: user.phone,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  requireAuth,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty if provided'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('password').optional().notEmpty().withMessage('Current password is required for verification'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // User is already attached to req by requireAuth middleware
    const user = req.user as IUser & Document;

    // Update basic profile fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.zipCode = req.body.zipCode || user.zipCode;
    user.phone = req.body.phone || user.phone;

    // Handle password change if requested
    if (req.body.password && req.body.newPassword) {
      // Verify the current password first
      const isMatch = await user.comparePassword(req.body.password);

      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }

      // Set the new password
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      city: updatedUser.city,
      zipCode: updatedUser.zipCode,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id.toString())
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', [requireAuth, requireAdmin], async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const sort = req.query.sort as string || 'createdAt';
    const order = req.query.order as string || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const users = await User.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-password');
    
    const total = await User.countDocuments(searchFilter);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', [requireAuth, requireAdmin], async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH /api/users/:id/admin-status
// @desc    Update user admin status (admin only)
// @access  Private/Admin
router.patch('/:id/admin-status', [requireAuth, requireAdmin], async (req: Request, res: Response): Promise<void> => {
  try {
    const { isAdmin } = req.body;
    
    if (isAdmin === undefined) {
      res.status(400).json({ message: 'isAdmin field is required' });
      return;
    }
    
    // Don't allow users to remove their own admin status
    const adminUser = req.user as IUser & Document;
    if (req.params.id === adminUser._id.toString() && !isAdmin) {
      res.status(400).json({ message: 'You cannot remove your own admin status' });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/:id', [requireAuth, requireAdmin], async (req: Request, res: Response): Promise<void> => {
  try {
    // Don't allow users to delete themselves
    const adminUser = req.user as IUser & Document;
    if (req.params.id === adminUser._id.toString()) {
      res.status(400).json({ message: 'You cannot delete your own account' });
      return;
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
