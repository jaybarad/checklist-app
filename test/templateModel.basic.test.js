require('./setup');
const Template = require('../models/Template');
const User = require('../models/User');
const { createTestUser, createTemplateData } = require('./testUtils');

describe('Template Model Basic Tests', () => {
  describe('Schema Validation', () => {
    it('should create a valid system template', async () => {
      const templateData = createTemplateData({
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
      });

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
      const templateData = createTemplateData({
        name: 'My Custom Template',
        type: 'user',
        category: 'custom',
        userId: user._id,
        items: [{
          name: 'Custom Item',
          defaultPrice: 10.00
        }]
      });

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate.userId).toEqual(user._id);
      expect(savedTemplate.type).toBe('user');
    });

    it('should fail validation without required fields', async () => {
      const template = new Template({});
      
      let errorThrown = false;
      try {
        await template.save();
      } catch (error) {
        errorThrown = true;
        expect(error.name).toBe('ValidationError');
      }
      expect(errorThrown).toBe(true);
    });

    it('should fail validation with invalid category', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'invalid_category',
        items: [{ name: 'Test Item' }]
      });

      const template = new Template(templateData);
      
      let errorThrown = false;
      try {
        await template.save();
      } catch (error) {
        errorThrown = true;
        expect(error.message).toContain('Invalid category selection');
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    it('should calculate estimated total including optional items', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      }));
      await template.save();

      const total = template.calculateEstimatedTotal(true);
      expect(total).toBe(15.00);
    });

    it('should calculate estimated total excluding optional items', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      }));
      await template.save();

      const total = template.calculateEstimatedTotal(false);
      expect(total).toBe(10.00);
    });

    it('should increment usage count', async () => {
      const template = new Template(createTemplateData({
        name: 'Usage Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Usage Item' }]
      }));
      await template.save();

      const initialCount = template.usageCount;
      await template.incrementUsage();
      expect(template.usageCount).toBe(initialCount + 1);
    });
  });

  describe('Static Methods', () => {
    it('should find popular templates', async () => {
      await Template.create(createTemplateData({
        name: 'Popular Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Popular Item' }],
        usageCount: 100,
        rating: 5
      }));

      await Template.create(createTemplateData({
        name: 'Less Popular Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Less Popular Item' }],
        usageCount: 10,
        rating: 3
      }));

      const popular = await Template.findPopular(5);
      
      expect(popular.length).toBeGreaterThan(0);
      expect(popular[0].name).toBe('Popular Template');
    });

    it('should search templates by name', async () => {
      await Template.create(createTemplateData({
        name: 'Searchable Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Search Item' }]
      }));

      const results = await Template.searchTemplates('Searchable', null);
      
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Searchable Template');
    });

    it('should get system templates', async () => {
      await Template.create(createTemplateData({
        name: 'System Template Test',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'System Item' }]
      }));

      const systemTemplates = await Template.getSystemTemplates();
      
      expect(systemTemplates.length).toBeGreaterThan(0);
      expect(systemTemplates.every(t => t.type === 'system')).toBe(true);
    });
  });
});

console.log('Template Model Basic Tests loaded successfully');