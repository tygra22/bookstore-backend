import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import User from '../models/User';
import Book from '../models/Book';
import Order from '../models/Order';

const router: Router = Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({});
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    // Book statistics
    const totalBooks = await Book.countDocuments({});
    const lowStockBooks = await Book.countDocuments({ quantity: { $lt: 10 } });
    const outOfStockBooks = await Book.countDocuments({ quantity: 0 });

    // Order statistics
    const totalOrders = await Order.countDocuments({});
    const totalRevenue = await Order.aggregate([
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
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        newThisMonth: usersThisMonth
      },
      books: {
        total: totalBooks,
        lowStock: lowStockBooks,
        outOfStock: outOfStockBooks
      },
      orders: {
        total: totalOrders,
        revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyTrend: monthlyOrders
      }
    });
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/top-books
// @desc    Get top selling books
// @access  Private/Admin
router.get('/top-books', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get sales counts for each book by aggregating order items
    const topBooks = await Order.aggregate([
      // Unwind to get each order item as a separate document
      { $unwind: '$orderItems' },
      // Group by book to count sales
      { 
        $group: { 
          _id: '$orderItems.book',
          title: { $first: '$orderItems.title' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        } 
      },
      // Sort by quantity sold in descending order
      { $sort: { totalSold: -1 } },
      // Limit to top 5 books
      { $limit: 5 },
      // Lookup to get full book details
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      // Add fields from book details
      {
        $addFields: {
          author: { $arrayElemAt: ['$bookDetails.author', 0] },
          imageUrl: { $arrayElemAt: ['$bookDetails.imageUrl', 0] },
          genre: { $arrayElemAt: ['$bookDetails.genre', 0] }
        }
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          imageUrl: 1,
          genre: 1,
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    res.json(topBooks);
  } catch (error: any) {
    console.error('Error getting top books:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/low-stock
// @desc    Get books with low inventory levels
// @access  Private/Admin
router.get('/low-stock', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    // Find books with quantity less than threshold
    const lowStockBooks = await Book.find({ quantity: { $lt: threshold } })
      .sort({ quantity: 1 }) // Sort by quantity ascending (lowest first)
      .limit(limit);
    
    // Get count of critical stock (less than 5 units)
    const criticalStockCount = await Book.countDocuments({ quantity: { $lt: 5 } });
    
    // Get count of out of stock items
    const outOfStockCount = await Book.countDocuments({ quantity: 0 });
    
    res.json({
      books: lowStockBooks,
      counts: {
        lowStock: lowStockBooks.length,
        criticalStock: criticalStockCount,
        outOfStock: outOfStockCount
      },
      threshold
    });
  } catch (error: any) {
    console.error('Error getting low stock books:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/user-stats
// @desc    Get detailed user statistics
// @access  Private/Admin
router.get('/user-stats', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({});
    
    // Users created over time (by month)
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Count of admins vs regular users
    const adminCount = await User.countDocuments({ isAdmin: true });
    
    // Get most recent users
    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate current month's growth
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });
    
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const usersPrevMonth = await User.countDocuments({
      createdAt: { 
        $gte: prevMonthStart,
        $lte: prevMonthEnd
      }
    });
    
    const monthlyGrowthRate = usersPrevMonth > 0 
      ? ((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100 
      : 100;
    
    res.json({
      totalUsers,
      adminCount,
      regularUsers: totalUsers - adminCount,
      usersThisMonth,
      usersPrevMonth,
      monthlyGrowthRate,
      usersByMonth,
      recentUsers
    });
  } catch (error: any) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
