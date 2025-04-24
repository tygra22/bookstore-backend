import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a User document
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the User schema
const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isAdmin: {
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
UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // @ts-ignore
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      // Override the plaintext password with the hashed one
      this.password = hash;
      next();
    });
  });
});

// Method to compare passwords
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      // @ts-ignore
      resolve(isMatch);
    });
  });
};

// Create and export the User model
export default mongoose.model<IUser>('User', UserSchema);
