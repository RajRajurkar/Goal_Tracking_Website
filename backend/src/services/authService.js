const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const { UnauthorizedError, ValidationError } = require('../utils/errorTypes');

class AuthService {
  async login(email, password) {
    const user = await User.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await User.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department_id: user.department_id,
        manager_id: user.manager_id
      }
    };
  }

  async register(userData) {
    const existingUser = await User.findByEmail(userData.email);

    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department_id: user.department_id,
        manager_id: user.manager_id
      }
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByEmail(
      (await User.findById(userId)).email
    );

    const isPasswordValid = await User.comparePassword(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    await User.updatePassword(userId, newPassword);
  }
}

module.exports = new AuthService();