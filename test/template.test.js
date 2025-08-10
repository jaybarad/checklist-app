const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const Template = require('../models/Template');
const User = require('../models/User');
const Checklist = require('../models/Checklist');
const templateController = require('../controllers/templateController');
const templateRoutes = require('../routes/template');
const { protect } = require('../middleware/auth');
const {
  createTestUser,
  generateAuthToken,
  authenticatedRequest,
  createTemplateData,
  validateTemplateStructure,
  validateChecklistStructure
} = require('./testUtils');

// Create a test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Mock session middleware
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  
  app.use(templateRoutes);
  return app;
};

describe('Template Model Tests', () => {
  describe('Schema Validation', () => {
    it('should create a valid system template', async () => {
      const templateData = {
        name: 'Weekly Shopping List',
        description: 'Essential items for weekly shopping',
        type: 'system',
        category: 'shopping',
        items: [{
          name: 'Milk',
          defaultPrice: 3.99,
          isOptional: false
        }],
        metadata: {
          season: ['all'],
          duration: 'medium',
          difficulty: 'beginner',
          tags: ['groceries', 'weekly']
        }
      };

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate._id).toBeDefined();
      expect(savedTemplate.name).toBe(templateData.name);
      expect(savedTemplate.type).toBe('system');
      expect(savedTemplate.usageCount).toBe(0);
      expect(savedTemplate.isPublic).toBe(false);
    });

    it('should create a valid user template', async () => {
      const user = await createTestUser();
      const templateData = {
        name: 'My Custom Template',
        type: 'user',
        category: 'custom',
        userId: user._id,
        items: [{
          name: 'Custom Item',
          defaultPrice: 10.00
        }]
      };

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate.userId).toEqual(user._id);
      expect(savedTemplate.type).toBe('user');
    });

    it('should fail validation without required fields', async () => {
      const template = new Template({});
      
      await expect(template.save()).rejects.toThrow();
    });

    it('should fail validation with invalid category', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'system',
        category: 'invalid_category',
        items: [{ name: 'Test Item' }]
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Invalid category selection/);
    });

    it('should fail validation with invalid type', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'invalid_type',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Template type must be either system or user/);
    });

    it('should require userId for user templates', async () => {
      const templateData = {
        name: 'User Template',
        type: 'user',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/User ID is required for user templates/);
    });

    it('should not require userId for system templates', async () => {
      const templateData = {
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      };

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate.userId).toBeUndefined();
    });

    it('should validate template items', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [] // Empty items array should fail
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Template must have at least one item/);
    });

    it('should validate enum fields in metadata', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        metadata: {
          season: ['invalid_season']
        }
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow();
    });

    it('should validate rating range', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        rating: 6 // Invalid rating > 5
      };

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Rating cannot exceed 5/);
    });
  });

  describe('Instance Methods', () => {
    let template;

    beforeEach(async () => {
      template = new Template({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      });
      await template.save();
    });

    it('should calculate estimated total including optional items', () => {
      const total = template.calculateEstimatedTotal(true);
      expect(total).toBe(15.00);
    });

    it('should calculate estimated total excluding optional items', () => {
      const total = template.calculateEstimatedTotal(false);
      expect(total).toBe(10.00);
    });

    it('should increment usage count', async () => {
      const initialCount = template.usageCount;
      await template.incrementUsage();
      expect(template.usageCount).toBe(initialCount + 1);
    });

    it('should get item alternatives', () => {
      template.items[0].alternatives = [
        { name: 'Alternative 1', price: 8.00 },
        { name: 'Alternative 2', price: 12.00 }
      ];

      const alternatives = template.getItemAlternatives('Required Item');
      expect(alternatives).toHaveLength(2);
      expect(alternatives[0].name).toBe('Alternative 1');
    });

    it('should return empty array for non-existent item alternatives', () => {
      const alternatives = template.getItemAlternatives('Non-existent Item');
      expect(alternatives).toEqual([]);
    });
  });

  describe('Virtual Properties', () => {
    let template;

    beforeEach(async () => {
      template = new Template({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      });
      await template.save();
    });

    it('should calculate virtual estimated total', () => {
      expect(template.calculatedEstimatedTotal).toBe(15.00);
    });

    it('should return required items only', () => {
      const requiredItems = template.requiredItems;
      expect(requiredItems).toHaveLength(1);
      expect(requiredItems[0].name).toBe('Required Item');
    });

    it('should return optional items only', () => {
      const optionalItems = template.optionalItems;
      expect(optionalItems).toHaveLength(1);
      expect(optionalItems[0].name).toBe('Optional Item');
    });
  });

  describe('Static Methods', () => {
    let user1, user2;
    let publicTemplate, privateTemplate, systemTemplate;

    beforeEach(async () => {
      user1 = await createTestUser();
      user2 = await createTestUser();

      systemTemplate = await Template.create({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'System Item', defaultPrice: 5.00 }],
        usageCount: 100,
        rating: 5
      });

      publicTemplate = await Template.create({
        name: 'Public User Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        isPublic: true,
        items: [{ name: 'Public Item', defaultPrice: 8.00 }],
        usageCount: 50,
        rating: 4
      });

      privateTemplate = await Template.create({
        name: 'Private User Template',
        type: 'user',
        category: 'travel',
        userId: user1._id,
        isPublic: false,
        items: [{ name: 'Private Item', defaultPrice: 15.00 }],
        usageCount: 10,
        rating: 3
      });
    });

    it('should find popular templates', async () => {
      const popular = await Template.findPopular(5);
      
      expect(popular).toHaveLength(2); // Only public templates
      expect(popular[0].name).toBe('System Template'); // Highest usage count
      expect(popular[1].name).toBe('Public User Template');
    });

    it('should find popular templates by category', async () => {
      const popular = await Template.findPopular(5, 'shopping');
      
      expect(popular).toHaveLength(2);
      expect(popular.every(t => t.category === 'shopping')).toBe(true);
    });

    it('should find templates by category', async () => {
      const shoppingTemplates = await Template.findByCategory('shopping', false, user1._id);
      
      expect(shoppingTemplates).toHaveLength(2);
      expect(shoppingTemplates.some(t => t.name === 'System Template')).toBe(true);
      expect(shoppingTemplates.some(t => t.name === 'Public User Template')).toBe(true);
    });

    it('should find templates by category including private for owner', async () => {
      const userTemplates = await Template.findByCategory('travel', false, user1._id);
      
      expect(userTemplates).toHaveLength(1);
      expect(userTemplates[0].name).toBe('Private User Template');
    });

    it('should search templates by name', async () => {
      const results = await Template.searchTemplates('System', user1._id);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('System Template');
    });

    it('should search templates by tags', async () => {
      await Template.create({
        name: 'Tagged Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Tagged Item' }],
        isPublic: true,
        metadata: { tags: ['groceries', 'weekly'] }
      });

      const results = await Template.searchTemplates('groceries', user1._id);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Tagged Template');
    });

    it('should get system templates', async () => {
      const systemTemplates = await Template.getSystemTemplates();
      
      expect(systemTemplates).toHaveLength(1);
      expect(systemTemplates[0].type).toBe('system');
    });

    it('should get system templates by category', async () => {
      const systemShoppingTemplates = await Template.getSystemTemplates('shopping');
      
      expect(systemShoppingTemplates).toHaveLength(1);
      expect(systemShoppingTemplates[0].category).toBe('shopping');
    });

    it('should get user templates', async () => {
      const userTemplates = await Template.getUserTemplates(user1._id);
      
      expect(userTemplates).toHaveLength(2);
      expect(userTemplates.every(t => t.userId.toString() === user1._id.toString())).toBe(true);
    });
  });

  describe('Middleware', () => {
    it('should update estimated total on save', async () => {
      const template = new Template({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Item 2', defaultPrice: 5.00, isOptional: true }
        ]
      });

      await template.save();
      
      expect(template.metadata.estimatedTotal).toBe(10.00); // Only required items
    });

    it('should remove userId for system templates', async () => {
      const user = await createTestUser();
      const template = new Template({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        userId: user._id, // This should be removed
        items: [{ name: 'Test Item' }]
      });

      await template.save();
      
      expect(template.userId).toBeUndefined();
    });

    it('should filter empty tags', async () => {
      const template = new Template({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        metadata: {
          tags: ['valid-tag', '', '  ', 'another-valid-tag']
        }
      });

      await template.save();
      
      expect(template.metadata.tags).toEqual(['valid-tag', 'another-valid-tag']);
    });
  });
});

describe('Template Controller Tests', () => {
  let app, user1, user2;

  beforeEach(async () => {
    app = createTestApp();
    user1 = await createTestUser();
    user2 = await createTestUser();
  });

  describe('getAllTemplates', () => {
    it('should get all accessible templates', async () => {
      // Create test templates
      await Template.create({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'System Item' }]
      });

      await Template.create({
        name: 'User Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        isPublic: true,
        items: [{ name: 'User Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter templates by category', async () => {
      await Template.create({
        name: 'Shopping Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Shopping Item' }]
      });

      await Template.create({
        name: 'Travel Template',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Travel Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?category=shopping')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('shopping');
    });

    it('should search templates', async () => {
      await Template.create({
        name: 'Weekly Shopping List',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Weekly Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?search=Weekly')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Weekly');
    });

    it('should paginate results', async () => {
      // Create multiple templates
      for (let i = 0; i < 25; i++) {
        await Template.create({
          name: `Template ${i}`,
          type: 'system',
          category: 'shopping',
          items: [{ name: `Item ${i}` }]
        });
      }

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?page=2&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(2);
      expect(response.body.pagination.totalPages).toBeGreaterThan(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/templates')
        .expect(401);
    });
  });

  describe('getTemplateCategories', () => {
    it('should get template categories with counts', async () => {
      await Template.create({
        name: 'Shopping Template 1',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Item 1' }],
        rating: 5,
        usageCount: 10
      });

      await Template.create({
        name: 'Shopping Template 2',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Item 2' }],
        rating: 4,
        usageCount: 5
      });

      await Template.create({
        name: 'Travel Template',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Travel Item' }],
        rating: 3,
        usageCount: 8
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      
      const shoppingCategory = response.body.data.find(cat => cat.name === 'shopping');
      expect(shoppingCategory.count).toBe(2);
      expect(shoppingCategory.avgRating).toBe(4.5);
      expect(shoppingCategory.totalUsage).toBe(15);
    });
  });

  describe('getTemplateById', () => {
    it('should get template by ID', async () => {
      const template = await Template.create({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item', defaultPrice: 10.00 }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get(`/api/templates/${template._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Template');
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await authenticatedRequest(request(app), user1._id)
        .get(`/api/templates/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template not found');
    });

    it('should deny access to private templates of other users', async () => {
      const template = await Template.create({
        name: 'Private Template',
        type: 'user',
        category: 'shopping',
        userId: user2._id,
        isPublic: false,
        items: [{ name: 'Private Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get(`/api/templates/${template._id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied to this template');
    });

    it('should allow access to public templates', async () => {
      const template = await Template.create({
        name: 'Public Template',
        type: 'user',
        category: 'shopping',
        userId: user2._id,
        isPublic: true,
        items: [{ name: 'Public Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .get(`/api/templates/${template._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Public Template');
    });
  });

  describe('createTemplate', () => {
    it('should create a new user template', async () => {
      const templateData = {
        name: 'My Custom Template',
        description: 'A custom template for testing',
        category: 'custom',
        items: [
          { name: 'Custom Item 1', defaultPrice: 10.00 },
          { name: 'Custom Item 2', defaultPrice: 15.00, isOptional: true }
        ],
        metadata: {
          tags: ['test', 'custom']
        },
        isPublic: true
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send(templateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('My Custom Template');
      expect(response.body.data.type).toBe('user');
      expect(response.body.data.userId.toString()).toBe(user1._id.toString());
    });

    it('should validate required fields', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send({})
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should validate template name length', async () => {
      const templateData = {
        name: 'A',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send(templateData)
        .expect(422);

      expect(response.body.details.name).toBe('Template name must be at least 3 characters');
    });

    it('should validate category', async () => {
      const templateData = {
        name: 'Test Template',
        category: 'invalid_category',
        items: [{ name: 'Test Item' }]
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send(templateData)
        .expect(422);

      expect(response.body.details.category).toBe('Invalid category selection');
    });
  });

  describe('updateTemplate', () => {
    it('should update user template', async () => {
      const template = await Template.create({
        name: 'Original Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: [{ name: 'Original Item' }]
      });

      const updateData = {
        name: 'Updated Template',
        description: 'Updated description',
        category: 'travel',
        items: [{ name: 'Updated Item', defaultPrice: 20.00 }]
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .put(`/api/templates/${template._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Template');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should not allow updating other user templates', async () => {
      const template = await Template.create({
        name: 'Other User Template',
        type: 'user',
        category: 'shopping',
        userId: user2._id,
        items: [{ name: 'Other Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .put(`/api/templates/${template._id}`)
        .send({ name: 'Hacked Template' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You can only update your own templates');
    });

    it('should not allow updating system templates', async () => {
      const template = await Template.create({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'System Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .put(`/api/templates/${template._id}`)
        .send({ name: 'Hacked System Template' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete user template', async () => {
      const template = await Template.create({
        name: 'Template to Delete',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: [{ name: 'Delete Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .delete(`/api/templates/${template._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Template deleted successfully');

      // Verify template is actually deleted
      const deletedTemplate = await Template.findById(template._id);
      expect(deletedTemplate).toBeNull();
    });

    it('should not allow deleting other user templates', async () => {
      const template = await Template.create({
        name: 'Other User Template',
        type: 'user',
        category: 'shopping',
        userId: user2._id,
        items: [{ name: 'Other Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .delete(`/api/templates/${template._id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You can only delete your own templates');
    });
  });

  describe('useTemplate', () => {
    let template;

    beforeEach(async () => {
      template = await Template.create({
        name: 'Shopping Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      });
    });

    it('should create checklist from template', async () => {
      const requestData = {
        title: 'My Shopping List',
        selectedItems: [template.items[0]._id.toString()],
        customizations: {
          [template.items[0]._id.toString()]: {
            name: 'Custom Item Name',
            price: 12.00
          }
        }
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/use`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('My Shopping List');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe('Custom Item Name');
      expect(response.body.data.items[0].price).toBe(12.00);

      // Verify usage count was incremented
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.usageCount).toBe(1);
    });

    it('should create checklist with all required items if no selection', async () => {
      const requestData = {
        title: 'Auto Shopping List'
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/use`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1); // Only required items
      expect(response.body.data.items[0].name).toBe('Required Item');
    });

    it('should require title', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/use`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Checklist title is required');
    });

    it('should deny access to private templates', async () => {
      const privateTemplate = await Template.create({
        name: 'Private Template',
        type: 'user',
        category: 'shopping',
        userId: user2._id,
        isPublic: false,
        items: [{ name: 'Private Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${privateTemplate._id}/use`)
        .send({ title: 'Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied to this template');
    });
  });

  describe('rateTemplate', () => {
    it('should rate a template', async () => {
      const template = await Template.create({
        name: 'Template to Rate',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Rate Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/rate`)
        .send({ rating: 4 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(4);

      // Verify rating was saved
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.rating).toBe(4);
    });

    it('should validate rating range', async () => {
      const template = await Template.create({
        name: 'Template to Rate',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Rate Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/rate`)
        .send({ rating: 6 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be an integer between 1 and 5');
    });

    it('should require integer rating', async () => {
      const template = await Template.create({
        name: 'Template to Rate',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Rate Item' }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/templates/${template._id}/rate`)
        .send({ rating: 3.5 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Rating must be an integer between 1 and 5');
    });
  });

  describe('getSmartSuggestions', () => {
    beforeEach(async () => {
      // Create seasonal templates
      await Template.create({
        name: 'Winter Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Winter Item' }],
        usageCount: 50,
        rating: 5,
        metadata: { season: ['winter'] }
      });

      await Template.create({
        name: 'All Season Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'All Season Item' }],
        usageCount: 100,
        rating: 4,
        metadata: { season: ['all'] }
      });

      await Template.create({
        name: 'Popular Template',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Popular Item' }],
        usageCount: 200,
        rating: 5
      });
    });

    it('should get smart suggestions', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates/suggestions?limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      expect(response.body.context).toBeDefined();
      expect(response.body.context.season).toBeDefined();
    });

    it('should prioritize seasonal templates', async () => {
      // Mock getCurrentSeason to return winter
      const originalGetCurrentSeason = require('../controllers/templateController').__getCurrentSeason;
      
      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates/suggestions?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('saveChecklistAsTemplate', () => {
    let checklist;

    beforeEach(async () => {
      checklist = await Checklist.create({
        title: 'My Checklist',
        userId: user1._id,
        items: [
          { name: 'Checklist Item 1', price: 10.00 },
          { name: 'Checklist Item 2', price: 15.00 }
        ]
      });
    });

    it('should convert checklist to template', async () => {
      const requestData = {
        templateName: 'My New Template',
        templateDescription: 'Converted from checklist',
        templateCategory: 'custom',
        isPublic: true,
        metadata: {
          tags: ['converted', 'custom']
        }
      };

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/checklists/${checklist._id}/save-as-template`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('My New Template');
      expect(response.body.data.type).toBe('user');
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.items[0].name).toBe('Checklist Item 1');

      // Verify checklist was updated with template reference
      const updatedChecklist = await Checklist.findById(checklist._id);
      expect(updatedChecklist.templateId).toEqual(response.body.data._id);
    });

    it('should not allow converting other user checklists', async () => {
      const otherChecklist = await Checklist.create({
        title: 'Other User Checklist',
        userId: user2._id,
        items: [{ name: 'Other Item', price: 5.00 }]
      });

      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/checklists/${otherChecklist._id}/save-as-template`)
        .send({
          templateName: 'Hacked Template',
          templateCategory: 'custom'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You can only convert your own checklists to templates');
    });

    it('should require template name', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .post(`/api/checklists/${checklist._id}/save-as-template`)
        .send({
          templateCategory: 'custom'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Template name is required');
    });
  });
});

describe('Template Integration Tests', () => {
  let app, user1, user2;

  beforeEach(async () => {
    app = createTestApp();
    user1 = await createTestUser();
    user2 = await createTestUser();
  });

  describe('Template Usage Workflow', () => {
    it('should complete full template usage workflow', async () => {
      // 1. Create a template
      const templateData = {
        name: 'Integration Test Template',
        description: 'For integration testing',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Item 2', defaultPrice: 5.00, isOptional: true }
        ],
        isPublic: true,
        metadata: {
          tags: ['integration', 'test'],
          duration: 'short'
        }
      };

      const createResponse = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send(templateData)
        .expect(201);

      const templateId = createResponse.body.data._id;

      // 2. Use template to create checklist
      const useResponse = await authenticatedRequest(request(app), user2._id)
        .post(`/api/templates/${templateId}/use`)
        .send({
          title: 'Generated from Template',
          selectedItems: [createResponse.body.data.items[0]._id]
        })
        .expect(201);

      expect(useResponse.body.data.title).toBe('Generated from Template');
      expect(useResponse.body.data.items).toHaveLength(1);

      // 3. Rate the template
      await authenticatedRequest(request(app), user2._id)
        .post(`/api/templates/${templateId}/rate`)
        .send({ rating: 5 })
        .expect(200);

      // 4. Verify template usage count and rating
      const getResponse = await authenticatedRequest(request(app), user1._id)
        .get(`/api/templates/${templateId}`)
        .expect(200);

      expect(getResponse.body.data.usageCount).toBe(1);
      expect(getResponse.body.data.rating).toBe(5);

      // 5. Convert checklist back to template
      const saveResponse = await authenticatedRequest(request(app), user2._id)
        .post(`/api/checklists/${useResponse.body.data._id}/save-as-template`)
        .send({
          templateName: 'Derived Template',
          templateCategory: 'custom',
          isPublic: false
        })
        .expect(201);

      expect(saveResponse.body.data.name).toBe('Derived Template');
      expect(saveResponse.body.data.userId.toString()).toBe(user2._id.toString());
    });
  });

  describe('Search and Filter Integration', () => {
    beforeEach(async () => {
      // Create diverse templates for search testing
      await Template.create({
        name: 'Grocery Shopping List',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Groceries' }],
        usageCount: 100,
        rating: 5,
        metadata: { tags: ['groceries', 'food'], season: ['all'] }
      });

      await Template.create({
        name: 'Summer Vacation Packing',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Summer clothes' }],
        usageCount: 50,
        rating: 4,
        metadata: { tags: ['vacation', 'summer'], season: ['summer'] }
      });

      await Template.create({
        name: 'Holiday Party Planning',
        type: 'user',
        category: 'event',
        userId: user1._id,
        isPublic: true,
        items: [{ name: 'Party supplies' }],
        usageCount: 25,
        rating: 4,
        metadata: { tags: ['party', 'holiday'], season: ['winter'] }
      });
    });

    it('should handle complex search queries', async () => {
      // Search by tag
      const tagResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?search=groceries')
        .expect(200);

      expect(tagResponse.body.data).toHaveLength(1);
      expect(tagResponse.body.data[0].name).toBe('Grocery Shopping List');

      // Search by category
      const categoryResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?category=travel')
        .expect(200);

      expect(categoryResponse.body.data).toHaveLength(1);
      expect(categoryResponse.body.data[0].category).toBe('travel');

      // Search with multiple filters
      const multiResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?category=event&type=user&search=party')
        .expect(200);

      expect(multiResponse.body.data).toHaveLength(1);
      expect(multiResponse.body.data[0].name).toBe('Holiday Party Planning');
    });

    it('should handle sorting options', async () => {
      // Sort by popularity
      const popularResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?sort=popular')
        .expect(200);

      expect(popularResponse.body.data[0].usageCount).toBeGreaterThanOrEqual(
        popularResponse.body.data[1].usageCount
      );

      // Sort by rating
      const ratingResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?sort=rating')
        .expect(200);

      expect(ratingResponse.body.data[0].rating).toBeGreaterThanOrEqual(
        ratingResponse.body.data[1].rating || 0
      );

      // Sort by name
      const nameResponse = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?sort=name')
        .expect(200);

      expect(nameResponse.body.data[0].name.localeCompare(
        nameResponse.body.data[1].name
      )).toBeLessThanOrEqual(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large template datasets efficiently', async () => {
      // Create 100 templates
      const templates = [];
      for (let i = 0; i < 100; i++) {
        templates.push({
          name: `Performance Template ${i}`,
          type: 'system',
          category: i % 2 === 0 ? 'shopping' : 'travel',
          items: [{ name: `Item ${i}`, defaultPrice: i }],
          usageCount: Math.floor(Math.random() * 100),
          rating: Math.floor(Math.random() * 5) + 1,
          metadata: { tags: [`tag${i % 10}`] }
        });
      }

      await Template.insertMany(templates);

      // Test pagination performance
      const start = Date.now();
      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates?page=5&limit=10')
        .expect(200);
      const duration = Date.now() - start;

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.currentPage).toBe(5);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent template usage', async () => {
      const template = await Template.create({
        name: 'Concurrent Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Concurrent Item', defaultPrice: 10.00 }]
      });

      // Simulate concurrent usage from multiple users
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          authenticatedRequest(request(app), user1._id)
            .post(`/api/templates/${template._id}/use`)
            .send({ title: `Concurrent List ${i}` })
        );
      }

      const results = await Promise.all(promises);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(201);
      });

      // Verify final usage count
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.usageCount).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Temporarily disconnect from database
      await mongoose.disconnect();

      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch templates');

      // Reconnect for cleanup
      const mongoServer = global.__MONGO_URI__;
      await mongoose.connect(mongoServer);
    });

    it('should handle malformed request data', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .post('/api/templates')
        .send({ malformed: 'data' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle invalid object IDs', async () => {
      const response = await authenticatedRequest(request(app), user1._id)
        .get('/api/templates/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid template ID format');
    });
  });

  describe('Authorization Edge Cases', () => {
    it('should prevent access without authentication', async () => {
      await request(app)
        .get('/api/templates')
        .expect(401);
    });

    it('should handle expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: user1._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/templates')
        .set('Cookie', [`session=s%3A${encodeURIComponent(`{"token":"${expiredToken}"}`)}.signature`])
        .expect(401);
    });

    it('should handle template ownership changes', async () => {
      const template = await Template.create({
        name: 'Ownership Test Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: [{ name: 'Test Item' }]
      });

      // Try to update template as different user
      const response = await authenticatedRequest(request(app), user2._id)
        .put(`/api/templates/${template._id}`)
        .send({ name: 'Hacked Template' })
        .expect(403);

      expect(response.body.success).toBe(false);

      // Verify template wasn't modified
      const unchangedTemplate = await Template.findById(template._id);
      expect(unchangedTemplate.name).toBe('Ownership Test Template');
    });
  });
});