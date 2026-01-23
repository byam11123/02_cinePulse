import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { username, email, password } = userData;

    // Validate input
    this.validateUserData({ username, email, password });

    // Check if user already exists
    await this.checkUserExists(email, username);

    // Create new user
    const PROFILE_PIC_URL = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];
    const image = PROFILE_PIC_URL[Math.floor(Math.random() * PROFILE_PIC_URL.length)];

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image,
    });

    const savedUser = await newUser.save();

    logger.info('New user registered', { userId: savedUser._id, email: savedUser.email });

    return savedUser;
  }

  /**
   * Login user
   */
  async login(credentials, res) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new ValidationError("All fields are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new ValidationError("Invalid credentials");
    }

    // Generate JWT token
    const token = generateTokenAndSetCookie(user._id, res);

    logger.info('User logged in', { userId: user._id, email: user.email });

    return {
      ...user.toObject(),
      password: undefined // Don't return password
    };
  }

  /**
   * Logout user
   */
  async logout(res) {
    res.clearCookie("jwt-cinepulse");
    logger.info('User logged out');
    return { message: "Logged out successfully" };
  }

  /**
   * Get authenticated user
   */
  async getAuthUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ValidationError("User not found");
    }
    return user;
  }

  /**
   * Validate user data
   */
  validateUserData({ username, email, password }) {
    if (!username || !email || !password) {
      throw new ValidationError("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }
  }

  /**
   * Check if user already exists
   */
  async checkUserExists(email, username) {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      throw new ValidationError("Email already in use");
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new ValidationError("Username already exist");
    }
  }
}

export default new AuthService();