import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Middleware to authenticate with JWT
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: IUser) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: IUser) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware for local authentication (login)
export const localAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: Error, user: IUser, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};
