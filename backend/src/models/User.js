const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic auth fields
  name: { type: String, required: true }, // Keep for backward compatibility
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  
  // Onboarding fields (from OnboardingPage)
  fullName: { type: String, required: true }, // Primary name field from frontend
  phone: String, // Including country code
  countryCode: { type: String, default: '+1' },
  interests: String, // User's interests
  nativeLanguage: String, // Native language (renamed to avoid conflict)
  city: String, // User's city
  country: String, // User's country
  profilePic: String, // Profile picture URL
  location: String, // Combined city, country
  
  // Onboarding status
  isOnboarded: { type: Boolean, default: false },
  
  // User preferences and settings
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'retro' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      tripReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, default: 'friends', enum: ['public', 'friends', 'private'] },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true }
    }
  },
  
  // Travel related data
  savedDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
  travelStyle: String, // solo, couple, family, friends, business
  budgetRange: String, // budget, mid-range, luxury
  
  // Account status and metadata
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLoginAt: Date,
  loginCount: { type: Number, default: 0 },
  
  // Legacy fields for backward compatibility
  avatarUrl: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ fullName: 'text' });
UserSchema.index({ location: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// User utility methods (can add trip-related methods here later)

// Don't include sensitive data in JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', UserSchema);

