const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const { createTestUser, createTemplateData, validateTemplateStructure } = require('./testUtils');

describe('Template Model Tests', () => {
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

      validateTemplateStructure(savedTemplate);
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
      
      await expect(template.save()).rejects.toThrow();
    });

    it('should fail validation with invalid category', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'invalid_category',
        items: [{ name: 'Test Item' }]
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Invalid category selection/);
    });

    it('should fail validation with invalid type', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'invalid_type',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Template type must be either system or user/);
    });

    it('should require userId for user templates', async () => {
      const templateData = createTemplateData({
        name: 'User Template',
        type: 'user',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/User ID is required for user templates/);
    });

    it('should not require userId for system templates', async () => {
      const templateData = createTemplateData({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      });

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate.userId).toBeUndefined();
    });

    it('should validate template items', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [] // Empty items array should fail
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Template must have at least one item/);
    });

    it('should validate enum fields in metadata', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        metadata: {
          season: ['invalid_season']
        }
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow();
    });

    it('should validate rating range', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        rating: 6 // Invalid rating > 5
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Rating cannot exceed 5/);
    });

    it('should validate minimum rating', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        rating: 0 // Invalid rating < 1
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow(/Rating must be at least 1/);
    });

    it('should validate item name length', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{
          name: 'A'.repeat(101), // Too long
          defaultPrice: 5.00
        }]
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow();
    });

    it('should validate negative item price', async () => {
      const templateData = createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{
          name: 'Test Item',
          defaultPrice: -5.00 // Negative price should fail
        }]
      });

      const template = new Template(templateData);
      
      await expect(template.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let template;

    beforeEach(async () => {
      template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
        ]
      }));
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

    it('should calculate estimated total with default parameter (include optional)', () => {
      const total = template.calculateEstimatedTotal();
      expect(total).toBe(15.00);
    });

    it('should increment usage count', async () => {
      const initialCount = template.usageCount;
      await template.incrementUsage();
      expect(template.usageCount).toBe(initialCount + 1);
    });

    it('should increment usage count multiple times', async () => {
      const initialCount = template.usageCount;
      await template.incrementUsage();
      await template.incrementUsage();
      await template.incrementUsage();
      expect(template.usageCount).toBe(initialCount + 3);
    });

    it('should get item alternatives', () => {
      template.items[0].alternatives = [
        { name: 'Alternative 1', price: 8.00 },
        { name: 'Alternative 2', price: 12.00 }
      ];

      const alternatives = template.getItemAlternatives('Required Item');
      expect(alternatives).toHaveLength(2);
      expect(alternatives[0].name).toBe('Alternative 1');
      expect(alternatives[0].price).toBe(8.00);
      expect(alternatives[1].name).toBe('Alternative 2');
      expect(alternatives[1].price).toBe(12.00);
    });

    it('should return empty array for non-existent item alternatives', () => {
      const alternatives = template.getItemAlternatives('Non-existent Item');
      expect(alternatives).toEqual([]);
    });

    it('should handle case-sensitive item names', () => {
      template.items[0].alternatives = [
        { name: 'Alternative 1', price: 8.00 }
      ];

      const alternatives = template.getItemAlternatives('required item'); // lowercase
      expect(alternatives).toEqual([]);
    });
  });

  describe('Virtual Properties', () => {
    let template;

    beforeEach(async () => {
      template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
          { name: 'Optional Item', defaultPrice: 5.00, isOptional: true },
          { name: 'Another Optional', defaultPrice: 3.00, isOptional: true }
        ]
      }));
      await template.save();
    });

    it('should calculate virtual estimated total', () => {
      expect(template.calculatedEstimatedTotal).toBe(18.00);
    });

    it('should return required items only', () => {
      const requiredItems = template.requiredItems;
      expect(requiredItems).toHaveLength(1);
      expect(requiredItems[0].name).toBe('Required Item');
      expect(requiredItems[0].isOptional).toBe(false);
    });

    it('should return optional items only', () => {
      const optionalItems = template.optionalItems;
      expect(optionalItems).toHaveLength(2);
      expect(optionalItems[0].name).toBe('Optional Item');
      expect(optionalItems[1].name).toBe('Another Optional');
      expect(optionalItems.every(item => item.isOptional)).toBe(true);
    });

    it('should handle templates with no optional items', async () => {
      const onlyRequired = new Template(createTemplateData({
        name: 'Required Only Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Required Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Required Item 2', defaultPrice: 5.00, isOptional: false }
        ]
      }));
      await onlyRequired.save();

      expect(onlyRequired.requiredItems).toHaveLength(2);
      expect(onlyRequired.optionalItems).toHaveLength(0);
    });

    it('should handle templates with no required items', async () => {
      const onlyOptional = new Template(createTemplateData({
        name: 'Optional Only Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Optional Item 1', defaultPrice: 10.00, isOptional: true },
          { name: 'Optional Item 2', defaultPrice: 5.00, isOptional: true }
        ]
      }));
      await onlyOptional.save();

      expect(onlyOptional.requiredItems).toHaveLength(0);
      expect(onlyOptional.optionalItems).toHaveLength(2);
    });
  });

  describe('Static Methods', () => {
    let user1, user2;
    let publicTemplate, privateTemplate, systemTemplate;

    beforeEach(async () => {
      user1 = await createTestUser();
      user2 = await createTestUser();

      systemTemplate = await Template.create(createTemplateData({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'System Item', defaultPrice: 5.00 }],
        usageCount: 100,
        rating: 5
      }));

      publicTemplate = await Template.create(createTemplateData({
        name: 'Public User Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        isPublic: true,
        items: [{ name: 'Public Item', defaultPrice: 8.00 }],
        usageCount: 50,
        rating: 4
      }));

      privateTemplate = await Template.create(createTemplateData({
        name: 'Private User Template',
        type: 'user',
        category: 'travel',
        userId: user1._id,
        isPublic: false,
        items: [{ name: 'Private Item', defaultPrice: 15.00 }],
        usageCount: 10,
        rating: 3
      }));
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

    it('should limit popular templates results', async () => {
      const popular = await Template.findPopular(1);
      
      expect(popular).toHaveLength(1);
      expect(popular[0].name).toBe('System Template');
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

    it('should not find private templates for non-owner', async () => {
      const userTemplates = await Template.findByCategory('travel', false, user2._id);
      
      expect(userTemplates).toHaveLength(0);
    });

    it('should search templates by name', async () => {
      const results = await Template.searchTemplates('System', user1._id);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('System Template');
    });

    it('should search templates by description', async () => {
      await Template.create(createTemplateData({
        name: 'Searchable Template',
        description: 'This template is for weekly grocery shopping',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Searchable Item' }],
        isPublic: true
      }));

      const results = await Template.searchTemplates('weekly grocery', user1._id);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Searchable Template');
    });

    it('should search templates by tags', async () => {
      await Template.create(createTemplateData({
        name: 'Tagged Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Tagged Item' }],
        isPublic: true,
        metadata: { tags: ['groceries', 'weekly'] }
      }));

      const results = await Template.searchTemplates('groceries', user1._id);
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Tagged Template');
    });

    it('should return empty array for no search results', async () => {
      const results = await Template.searchTemplates('nonexistent', user1._id);
      
      expect(results).toHaveLength(0);
    });

    it('should get system templates', async () => {
      const systemTemplates = await Template.getSystemTemplates();
      
      expect(systemTemplates).toHaveLength(1);
      expect(systemTemplates[0].type).toBe('system');
      expect(systemTemplates[0].name).toBe('System Template');
    });

    it('should get system templates by category', async () => {
      await Template.create(createTemplateData({
        name: 'System Travel Template',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Travel Item' }]
      }));

      const systemShoppingTemplates = await Template.getSystemTemplates('shopping');
      const systemTravelTemplates = await Template.getSystemTemplates('travel');
      
      expect(systemShoppingTemplates).toHaveLength(1);
      expect(systemShoppingTemplates[0].category).toBe('shopping');
      expect(systemTravelTemplates).toHaveLength(1);
      expect(systemTravelTemplates[0].category).toBe('travel');
    });

    it('should get user templates', async () => {
      const userTemplates = await Template.getUserTemplates(user1._id);
      
      expect(userTemplates).toHaveLength(2);
      expect(userTemplates.every(t => t.userId.toString() === user1._id.toString())).toBe(true);
    });

    it('should sort user templates by creation date (newest first)', async () => {
      // Create another template for user1
      await Template.create(createTemplateData({
        name: 'Newest User Template',
        type: 'user',
        category: 'custom',
        userId: user1._id,
        items: [{ name: 'Newest Item' }]
      }));

      const userTemplates = await Template.getUserTemplates(user1._id);
      
      expect(userTemplates).toHaveLength(3);
      expect(userTemplates[0].name).toBe('Newest User Template'); // Should be first (newest)
    });

    it('should return empty array for user with no templates', async () => {
      const userTemplates = await Template.getUserTemplates(user2._id);
      
      expect(userTemplates).toHaveLength(0);
    });
  });

  describe('Middleware', () => {
    it('should update estimated total on save', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Item 2', defaultPrice: 5.00, isOptional: true }
        ]
      }));

      await template.save();
      
      expect(template.metadata.estimatedTotal).toBe(10.00); // Only required items
    });

    it('should update estimated total when items are modified', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false }
        ]
      }));

      await template.save();
      expect(template.metadata.estimatedTotal).toBe(10.00);

      // Modify items
      template.items.push({ name: 'Item 2', defaultPrice: 15.00, isOptional: false });
      await template.save();
      
      expect(template.metadata.estimatedTotal).toBe(25.00);
    });

    it('should remove userId for system templates', async () => {
      const user = await createTestUser();
      const template = new Template(createTemplateData({
        name: 'System Template',
        type: 'system',
        category: 'shopping',
        userId: user._id, // This should be removed
        items: [{ name: 'Test Item' }]
      }));

      await template.save();
      
      expect(template.userId).toBeUndefined();
    });

    it('should filter empty tags', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        metadata: {
          tags: ['valid-tag', '', '  ', 'another-valid-tag', null, undefined]
        }
      }));

      await template.save();
      
      expect(template.metadata.tags).toEqual(['valid-tag', 'another-valid-tag']);
    });

    it('should handle empty metadata tags array', async () => {
      const template = new Template(createTemplateData({
        name: 'Test Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }],
        metadata: {
          tags: []
        }
      }));

      await template.save();
      
      expect(template.metadata.tags).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long template names', async () => {
      const longName = 'A'.repeat(100); // Maximum length
      const template = new Template(createTemplateData({
        name: longName,
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Test Item' }]
      }));

      const savedTemplate = await template.save();
      expect(savedTemplate.name).toBe(longName);
    });

    it('should handle templates with many items', async () => {
      const manyItems = [];
      for (let i = 0; i < 50; i++) {
        manyItems.push({
          name: `Item ${i}`,
          defaultPrice: i * 0.5,
          isOptional: i % 2 === 0
        });
      }

      const template = new Template(createTemplateData({
        name: 'Many Items Template',
        type: 'system',
        category: 'shopping',
        items: manyItems
      }));

      const savedTemplate = await template.save();
      expect(savedTemplate.items).toHaveLength(50);
    });

    it('should handle zero price items', async () => {
      const template = new Template(createTemplateData({
        name: 'Zero Price Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Free Item', defaultPrice: 0 },
          { name: 'Another Free Item', defaultPrice: 0.00 }
        ]
      }));

      const savedTemplate = await template.save();
      expect(savedTemplate.calculateEstimatedTotal()).toBe(0);
    });

    it('should handle templates with complex alternatives', async () => {
      const template = new Template(createTemplateData({
        name: 'Complex Alternatives Template',
        type: 'system',
        category: 'shopping',
        items: [{
          name: 'Main Item',
          defaultPrice: 10.00,
          alternatives: [
            { name: 'Alternative 1', price: 8.00 },
            { name: 'Alternative 2', price: 12.00 },
            { name: 'Alternative 3', price: 15.00 }
          ]
        }]
      }));

      const savedTemplate = await template.save();
      const alternatives = savedTemplate.getItemAlternatives('Main Item');
      expect(alternatives).toHaveLength(3);
      expect(alternatives[2].price).toBe(15.00);
    });

    it('should handle concurrent saves properly', async () => {
      const template = new Template(createTemplateData({
        name: 'Concurrent Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Concurrent Item' }]
      }));

      // Save the template first
      await template.save();

      // Simulate concurrent updates
      const promise1 = template.incrementUsage();
      const promise2 = template.incrementUsage();
      
      await Promise.all([promise1, promise2]);
      
      // Reload to get final state
      await template.reload();
      expect(template.usageCount).toBe(2);
    });
  });
});