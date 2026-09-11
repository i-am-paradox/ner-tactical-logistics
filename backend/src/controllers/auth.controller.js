const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// POST /api/v1/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role, districtId, districtName, phone, preferredLanguage } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'field_agent',
      districtId: districtId || 'AS-KAM',
      districtName: districtName || 'Kamrup Metropolitan',
      phone: phone || '+91 94350 00000',
      preferredLanguage: preferredLanguage || 'en'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        districtId: user.districtId,
        districtName: user.districtName,
        preferredLanguage: user.preferredLanguage,
        badgeNumber: user.badgeNumber,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        districtId: user.districtId,
        districtName: user.districtName,
        preferredLanguage: user.preferredLanguage,
        badgeNumber: user.badgeNumber,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/demo-login
async function demoLogin(req, res, next) {
  try {
    const { role = 'admin' } = req.body;
    let user = await User.findOne({ role });

    if (!user) {
      // Auto-create demo user for the chosen role if not found
      const names = {
        admin: 'Commandant R. K. Sharma (NERHQ)',
        district_officer: 'District Officer P. Sangma',
        field_agent: 'Field Agent J. Lyngdoh',
        driver: 'Convoy Lead Bikash Borah'
      };
      user = await User.create({
        name: names[role] || `${role.toUpperCase()} Officer`,
        email: `${role}@nerlogistics.gov.in`,
        password: 'Password@123',
        role,
        districtId: 'AS-KAM',
        districtName: 'Kamrup Metropolitan'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `Switched into ${role} role session.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        districtId: user.districtId,
        districtName: user.districtName,
        preferredLanguage: user.preferredLanguage,
        badgeNumber: user.badgeNumber,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me
async function getProfile(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  demoLogin,
  getProfile
};
