const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAndSetToken, clearTokenCookie } = require('../utils/jwtUtils');

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'An account with this email already exists. Please use a different email or try logging in.' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({ 
      name: fullName, // Keep 'name' for backward compatibility
      fullName, 
      email: email.toLowerCase(), 
      passwordHash 
    });

    // Generate token and set cookie
    const token = generateAndSetToken(res, user._id);

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token, // Also return token for compatibility
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
        location: user.location,
        language: user.language,
        interests: user.interests
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user (case insensitive email)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (user.deleted) {
      return res.status(400).json({ 
        success: false,
        message: 'Account has been deactivated' 
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update last login and increment login count
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.updatedAt = new Date();
    await user.save();

    // Generate token and set cookie
    const token = generateAndSetToken(res, user._id);
    
    res.json({ 
      success: true,
      message: 'Login successful',
      token, // Also return token for compatibility
      user: { 
        id: user._id, 
        fullName: user.fullName || user.name, 
        email: user.email,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
        location: user.location,
        language: user.language,
        interests: user.interests,
        phone: user.phone,
        createdAt: user.createdAt
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; // From auth middleware
    const {
      fullName,
      interests,
      language,
      location,
      profilePic,
      email,
      phone
    } = req.body;

    // Validation
    if (!fullName) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name is required' 
      });
    }

    const updateData = {
      fullName,
      interests,
      nativeLanguage: language, // Map frontend 'language' to 'nativeLanguage'
      location,
      profilePic,
      phone,
      isOnboarded: true,
      updatedAt: new Date()
    };

    // Update email only if provided and different
    if (email && email !== req.user.email) {
      // Check if new email is already in use
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is already in use by another account' 
        });
      }
      updateData.email = email.toLowerCase();
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        location: user.location,
        language: user.nativeLanguage, // Map back to 'language' for frontend
        interests: user.interests,
        phone: user.phone,
        isOnboarded: user.isOnboarded,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during onboarding' 
    });
  }
};

// Logout function
exports.logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    clearTokenCookie(res);
    
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout' 
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName || user.name,
        email: user.email,
        profilePic: user.profilePic,
        isOnboarded: user.isOnboarded,
        location: user.location,
        language: user.language,
        interests: user.interests,
        phone: user.phone,
        createdAt: user.createdAt,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};