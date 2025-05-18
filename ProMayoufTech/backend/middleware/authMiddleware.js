import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/userModel.js';
import { JWT_SECRET } from '../config/config.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user but exclude password & reset token fields for security
      req.user = await User.findById(decoded.userId).select('-password -resetPasswordToken -resetPasswordExpires');

      // Check if token is about to expire (within 30 minutes) and refresh it
      const tokenExp = new Date(decoded.exp * 1000);
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      if (tokenExp < thirtyMinutesFromNow) {
        // Token is about to expire, refresh it
        const refreshedToken = jwt.sign({
          userId: req.user._id
        }, JWT_SECRET, {
          expiresIn: '12h',
        });

        res.cookie('jwt', refreshedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: 12 * 60 * 60 * 1000,
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export {
  protect,
  admin
};