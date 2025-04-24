import express, { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Book from '../models/Book';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router: Router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders with pagination and filtering
// @access  Private/Admin
router.get('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 1 : -1;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    
    // Build the query
    const query: any = {};
    
    // Add search term if provided (search by order ID or user name/email)
    if (search) {
      // Find users matching the search term
      const users = await mongoose.model('User').find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }, '_id');
      
      // Get the user IDs
      const userIds = users.map(user => user._id);
      
      query.$or = [
        // Search by order ID if the search term looks like an ID
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
        // Search by user
        { user: { $in: userIds } }
      ];
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Filter by status
    if (status) {
      if (status === 'paid') query.isPaid = true;
      else if (status === 'unpaid') query.isPaid = false;
      else if (status === 'delivered') query.isDelivered = true;
      else if (status === 'processing') {
        query.isPaid = true;
        query.isDelivered = false;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Create sort object
    const sort: any = {};
    sort[sortField] = sortOrder;
    
    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('user', 'id name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders with pagination and sorting
// @access  Private
router.get('/myorders', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 1 : -1;
    const status = req.query.status as string;
    
    // Build the query
    const query: any = { user: req.user?._id };
    
    // Filter by status
    if (status) {
      if (status === 'paid') query.isPaid = true;
      else if (status === 'unpaid') query.isPaid = false;
      else if (status === 'delivered') query.isDelivered = true;
      else if (status === 'processing') {
        query.isPaid = true;
        query.isDelivered = false;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Create sort object
    const sort: any = {};
    sort[sortField] = sortOrder;
    
    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('orderItems.book', 'title author imageUrl') // Populate book details
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private/Admin
router.get('/stats', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic statistics
    const totalOrders = await Order.countDocuments({});
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const deliveredOrders = await Order.countDocuments({ isDelivered: true });
    const processingOrders = await Order.countDocuments({ isPaid: true, isDelivered: false });
    
    // Revenue statistics
    const revenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Monthly orders trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.json({
      statistics: {
        totalOrders,
        paidOrders,
        deliveredOrders,
        processingOrders,
        revenue: revenue.length > 0 ? revenue[0].total : 0
      },
      monthlyTrend: monthlyOrders
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID with detailed information
// @access  Private
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email address phone')
      .populate('orderItems.book', 'title author imageUrl price isbn publisher genre'); // Get detailed book info

    // Check if order exists
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Make sure the logged in user is either admin or the order owner
    if ((!req.user?.isAdmin) && order.user._id.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  requireAuth,
  body('orderItems').isArray().withMessage('Order items must be an array'),
  body('orderItems.*.book').notEmpty().withMessage('Book ID is required'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Ensure we have order items
    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    try {
      // Check inventory for each book first before creating the order
      for (const item of orderItems) {
        const book = await Book.findById(item.book);
        if (!book) {
          res.status(404).json({ 
            message: `Book not found: ${item.book}`
          });
          return;
        }
        
        // Check if enough stock is available
        if (book.quantity < item.quantity) {
          res.status(400).json({ 
            message: `Insufficient stock for book: ${book.title}. Available: ${book.quantity}, Ordered: ${item.quantity}`
          });
          return;
        }
      }

      // Create new order with paid and delivered status for school project simplicity
      const order = new Order({
        user: req.user?._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,                      // Mark as paid immediately
        paidAt: new Date(),                // Set payment time to now
        isDelivered: true,                 // Mark as delivered immediately
        deliveredAt: new Date(),           // Set delivery time to now
        paymentResult: req.body.paymentResult || {
          id: 'INSTANT_COMPLETE_' + Date.now(),
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: req.user?.email || ''
        }
      });

      // Save the order first
      const createdOrder = await order.save();
      
      // Now update inventory for each book in the order
      // Even if this fails, the order is still created
      try {
        for (const item of orderItems) {
          await Book.findByIdAndUpdate(item.book, {
            $inc: { quantity: -item.quantity }
          });
        }
      } catch (inventoryError) {
        console.error('Warning: Failed to update inventory', inventoryError);
        // Continue execution - we prioritize order creation over inventory in this case
        // For a production system, we would handle this differently
      }
      
      res.status(201).json(createdOrder);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        message: error.message || 'Server Error',
        error: process.env.NODE_ENV === 'production' ? 'Error creating order' : error.toString()
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the order and populate the book details for inventory management
    const order = await Order.findById(req.params.id).populate({
      path: 'orderItems.book',
      model: 'Book'
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Make sure the logged in user is either admin or the order owner
    if ((!req.user?.isAdmin) && order.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this order' });
      return;
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      res.status(400).json({ message: 'Order is already paid' });
      return;
    }
    
    // Use a session for transaction to ensure both order update and inventory update succeed or fail together
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Update inventory for each book in the order
      for (const item of order.orderItems) {
        const book = await Book.findById(item.book);
        if (!book) {
          throw new Error(`Book not found: ${item.book}`);
        }
        
        // Check if enough stock is available
        if (book.quantity < item.quantity) {
          throw new Error(`Insufficient stock for book: ${book.title}. Available: ${book.quantity}, Ordered: ${item.quantity}`);
        }
        
        // Reduce the book stock
        book.quantity -= item.quantity;
        await book.save({ session });
      }
      
      // Mark order as paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };
      
      // Save order with updated payment status
      const updatedOrder = await order.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.json(updatedOrder);
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error: any) {
    console.error('Error updating order to paid:', error);
    res.status(500).json({ 
      message: error.message || 'Server Error',
      error: process.env.NODE_ENV === 'production' ? 'Error updating order' : error.toString()
    });
  }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.trackingNumber = req.body.trackingNumber || '';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
