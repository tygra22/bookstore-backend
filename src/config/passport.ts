import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';

// JWT Strategy for token authentication
// Hard-coded JWT secret for Railway deployment
// NOTE: This is NOT best practice and should be temporary
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'HMteGawXDysvMBXBEXCeDKVBJuLrFyal' // Using the same secret as MongoDB password for simplicity
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find the user specified in token
      const user = await User.findById(payload.id);

      // If user doesn't exist, handle it
      if (!user) {
        return done(null, false);
      }

      // Otherwise, return the user
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Local Strategy for email/password authentication
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Find the user with the given email
        const user = await User.findOne({ email });

        // If user doesn't exist, handle it
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isMatch = await user.comparePassword(password);

        // If password doesn't match, handle it
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Otherwise, return the user
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
