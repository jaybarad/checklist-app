const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper to create test user
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    userId: `USR${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}${Math.random().toString(36).substr(2, 3)}`,
    password: await bcrypt.hash('testpassword', 10)
  };
  
  const userData = { ...defaultUser, ...overrides };
  const user = await User.create(userData);
  return user;
};

// Helper to generate JWT token
const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

// Helper to create authenticated request
const authenticatedRequest = (request, userId) => {
  const token = generateAuthToken(userId);
  return request.set('Authorization', `Bearer ${token}`);
};

// Mock template data factory
const createTemplateData = (overrides = {}) => {
  return {
    name: 'Test Template',
    description: 'A template for testing',
    category: 'shopping',
    items: [{
      name: 'Test Item',
      defaultPrice: 10.00,
      isOptional: false
    }],
    metadata: {
      season: ['all'],
      duration: 'medium',
      difficulty: 'beginner',
      tags: ['test']
    },
    ...overrides
  };
};

// Validate template structure helper
const validateTemplateStructure = (template) => {
  expect(template).toHaveProperty('_id');
  expect(template).toHaveProperty('name');
  expect(template).toHaveProperty('type');
  expect(template).toHaveProperty('category');
  expect(template).toHaveProperty('items');
  expect(template).toHaveProperty('createdAt');
  expect(template).toHaveProperty('updatedAt');
  expect(Array.isArray(template.items)).toBe(true);
  expect(template.items.length).toBeGreaterThan(0);
};

// Validate checklist structure helper
const validateChecklistStructure = (checklist) => {
  expect(checklist).toHaveProperty('_id');
  expect(checklist).toHaveProperty('title');
  expect(checklist).toHaveProperty('userId');
  expect(checklist).toHaveProperty('items');
  expect(checklist).toHaveProperty('createdAt');
  expect(checklist).toHaveProperty('updatedAt');
  expect(Array.isArray(checklist.items)).toBe(true);
};

module.exports = {
  createTestUser,
  generateAuthToken,
  authenticatedRequest,
  createTemplateData,
  validateTemplateStructure,
  validateChecklistStructure
};