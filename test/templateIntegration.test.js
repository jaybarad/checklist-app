const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const Checklist = require('../models/Checklist');
const { createTestUser, createTemplateData, validateTemplateStructure, validateChecklistStructure } = require('./testUtils');

describe('Template Integration Tests', () => {
  let user1, user2;

  beforeEach(async () => {
    user1 = await createTestUser();
    user2 = await createTestUser();
  });

  describe('Template to Checklist Conversion', () => {
    it('should successfully convert template to checklist', async () => {
      // Create a template
      const template = await Template.create(createTemplateData({
        name: 'Integration Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Item 2', defaultPrice: 5.00, isOptional: true }
        ],
        metadata: {
          season: ['all'],
          tags: ['integration', 'test']
        }
      }));

      // Convert template to checklist
      const checklistItems = template.items
        .filter(item => !item.isOptional)
        .map(item => ({
          name: item.name,
          price: item.defaultPrice || 0
        }));

      const checklist = await Checklist.create({
        title: 'Generated from Template',
        userId: user1._id,
        items: checklistItems,
        templateId: template._id
      });

      // Increment template usage
      await template.incrementUsage();

      // Verify checklist creation
      validateChecklistStructure(checklist);
      expect(checklist.title).toBe('Generated from Template');
      expect(checklist.items).toHaveLength(1); // Only required items
      expect(checklist.items[0].name).toBe('Item 1');
      expect(checklist.templateId).toEqual(template._id);

      // Verify template usage count
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.usageCount).toBe(1);
    });

    it('should handle template with customizations', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Customizable Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Base Item', defaultPrice: 10.00 },
          { name: 'Alternative Item', defaultPrice: 15.00 }
        ]
      }));

      // Create checklist with customizations
      const checklistItems = [
        { name: 'Custom Item Name', price: 12.50 }, // Customized
        { name: 'Alternative Item', price: 15.00 }   // As-is
      ];

      const checklist = await Checklist.create({
        title: 'Customized Checklist',
        userId: user1._id,
        items: checklistItems,
        templateId: template._id
      });

      validateChecklistStructure(checklist);
      expect(checklist.items[0].name).toBe('Custom Item Name');
      expect(checklist.items[0].price).toBe(12.50);
    });

    it('should maintain relationship between template and checklist', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Relationship Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Relationship Item', defaultPrice: 20.00 }]
      }));

      const checklist = await Checklist.create({
        title: 'Related Checklist',
        userId: user1._id,
        items: [{ name: 'Relationship Item', price: 20.00 }],
        templateId: template._id
      });

      // Find checklist by template
      const relatedChecklists = await Checklist.find({ templateId: template._id });
      expect(relatedChecklists).toHaveLength(1);
      expect(relatedChecklists[0]._id).toEqual(checklist._id);

      // Populate template in checklist query
      const populatedChecklist = await Checklist.findById(checklist._id)
        .populate('templateId', 'name category');
      
      expect(populatedChecklist.templateId.name).toBe('Relationship Template');
      expect(populatedChecklist.templateId.category).toBe('shopping');
    });
  });

  describe('Checklist to Template Conversion', () => {
    it('should convert checklist back to template', async () => {
      // Create original checklist
      const checklist = await Checklist.create({
        title: 'My Shopping List',
        userId: user1._id,
        items: [
          { name: 'Milk', price: 3.50 },
          { name: 'Bread', price: 2.00 },
          { name: 'Eggs', price: 4.00 }
        ]
      });

      // Convert to template
      const templateItems = checklist.items.map(item => ({
        name: item.name,
        defaultPrice: item.price || 0,
        isOptional: false,
        alternatives: []
      }));

      const template = await Template.create({
        name: 'Derived Shopping Template',
        description: 'Converted from checklist',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: templateItems,
        isPublic: false
      });

      // Update checklist to reference new template
      checklist.templateId = template._id;
      await checklist.save();

      // Verify template creation
      validateTemplateStructure(template);
      expect(template.name).toBe('Derived Shopping Template');
      expect(template.type).toBe('user');
      expect(template.items).toHaveLength(3);
      expect(template.items[0].name).toBe('Milk');
      expect(template.items[0].defaultPrice).toBe(3.50);

      // Verify checklist update
      const updatedChecklist = await Checklist.findById(checklist._id);
      expect(updatedChecklist.templateId).toEqual(template._id);
    });

    it('should preserve user ownership in conversion', async () => {
      const checklist = await Checklist.create({
        title: 'User Checklist',
        userId: user1._id,
        items: [{ name: 'User Item', price: 10.00 }]
      });

      const template = await Template.create({
        name: 'User Template',
        type: 'user',
        category: 'custom',
        userId: user1._id,
        items: [{ name: 'User Item', defaultPrice: 10.00 }]
      });

      expect(template.userId).toEqual(user1._id);
      expect(template.type).toBe('user');
    });
  });

  describe('Template Usage Tracking', () => {
    it('should track usage statistics accurately', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Usage Tracking Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Tracked Item', defaultPrice: 5.00 }]
      }));

      expect(template.usageCount).toBe(0);

      // Simulate multiple uses
      const usagePromises = [];
      for (let i = 0; i < 5; i++) {
        usagePromises.push(
          Checklist.create({
            title: `Usage Test ${i}`,
            userId: user1._id,
            items: [{ name: 'Tracked Item', price: 5.00 }],
            templateId: template._id
          }).then(() => template.incrementUsage())
        );
      }

      await Promise.all(usagePromises);

      // Verify final usage count
      const finalTemplate = await Template.findById(template._id);
      expect(finalTemplate.usageCount).toBe(5);
    });

    it('should handle concurrent usage increments', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Concurrent Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Concurrent Item' }]
      }));

      // Simulate concurrent usage
      const concurrentPromises = Array(10).fill().map(() => 
        template.incrementUsage()
      );

      await Promise.all(concurrentPromises);

      // Reload to get final state
      await template.reload();
      expect(template.usageCount).toBe(10);
    });
  });

  describe('Search and Filter Integration', () => {
    beforeEach(async () => {
      // Create diverse templates for search testing
      await Template.create(createTemplateData({
        name: 'Weekly Grocery Shopping',
        description: 'Essential groceries for the week',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Groceries' }],
        usageCount: 100,
        rating: 5,
        metadata: { tags: ['groceries', 'weekly'], season: ['all'] }
      }));

      await Template.create(createTemplateData({
        name: 'Summer Vacation Packing',
        description: 'Packing list for summer vacation',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Summer clothes' }],
        usageCount: 50,
        rating: 4,
        metadata: { tags: ['vacation', 'summer'], season: ['summer'] }
      }));

      await Template.create(createTemplateData({
        name: 'Holiday Party Planning',
        description: 'Planning checklist for holiday parties',
        type: 'user',
        category: 'event',
        userId: user1._id,
        isPublic: true,
        items: [{ name: 'Party supplies' }],
        usageCount: 25,
        rating: 4,
        metadata: { tags: ['party', 'holiday'], season: ['winter'] }
      }));
    });

    it('should search across multiple fields', async () => {
      // Search by name
      const nameResults = await Template.searchTemplates('Grocery', user1._id);
      expect(nameResults).toHaveLength(1);
      expect(nameResults[0].name).toBe('Weekly Grocery Shopping');

      // Search by description
      const descResults = await Template.searchTemplates('vacation', user1._id);
      expect(descResults).toHaveLength(1);
      expect(descResults[0].name).toBe('Summer Vacation Packing');

      // Search by tags
      const tagResults = await Template.searchTemplates('party', user1._id);
      expect(tagResults).toHaveLength(1);
      expect(tagResults[0].name).toBe('Holiday Party Planning');
    });

    it('should filter by category correctly', async () => {
      const shoppingTemplates = await Template.findByCategory('shopping', false, user1._id);
      const travelTemplates = await Template.findByCategory('travel', false, user1._id);
      const eventTemplates = await Template.findByCategory('event', false, user1._id);

      expect(shoppingTemplates).toHaveLength(1);
      expect(shoppingTemplates[0].category).toBe('shopping');

      expect(travelTemplates).toHaveLength(1);
      expect(travelTemplates[0].category).toBe('travel');

      expect(eventTemplates).toHaveLength(1);
      expect(eventTemplates[0].category).toBe('event');
    });

    it('should respect privacy settings in searches', async () => {
      // Create private template
      await Template.create(createTemplateData({
        name: 'Private Template',
        type: 'user',
        category: 'custom',
        userId: user2._id,
        isPublic: false,
        items: [{ name: 'Private Item' }],
        metadata: { tags: ['private'] }
      }));

      // User 1 should not find user 2's private template
      const user1Results = await Template.searchTemplates('Private', user1._id);
      expect(user1Results).toHaveLength(0);

      // User 2 should find their own private template
      const user2Results = await Template.searchTemplates('Private', user2._id);
      expect(user2Results).toHaveLength(1);
    });

    it('should sort results by relevance', async () => {
      const popularResults = await Template.findPopular(10);
      
      // Results should be sorted by usage count (descending), then rating (descending)
      expect(popularResults).toHaveLength(3);
      expect(popularResults[0].usageCount).toBeGreaterThanOrEqual(popularResults[1].usageCount);
      expect(popularResults[1].usageCount).toBeGreaterThanOrEqual(popularResults[2].usageCount);
    });
  });

  describe('Seasonal Suggestions Integration', () => {
    beforeEach(async () => {
      await Template.create(createTemplateData({
        name: 'Spring Cleaning',
        type: 'system',
        category: 'routine',
        items: [{ name: 'Cleaning supplies' }],
        usageCount: 30,
        metadata: { season: ['spring'] }
      }));

      await Template.create(createTemplateData({
        name: 'Summer Beach Trip',
        type: 'system',
        category: 'travel',
        items: [{ name: 'Beach gear' }],
        usageCount: 45,
        metadata: { season: ['summer'] }
      }));

      await Template.create(createTemplateData({
        name: 'Year Round Template',
        type: 'system',
        category: 'shopping',
        items: [{ name: 'Basic supplies' }],
        usageCount: 100,
        metadata: { season: ['all'] }
      }));
    });

    it('should provide seasonal suggestions', async () => {
      // Mock current season (this would normally be dynamic)
      const currentSeason = 'summer';
      
      const seasonalTemplates = await Template.find({
        $or: [
          { 'metadata.season': currentSeason },
          { 'metadata.season': 'all' }
        ],
        isPublic: true
      }).sort({ usageCount: -1 });

      expect(seasonalTemplates).toHaveLength(2);
      expect(seasonalTemplates[0].name).toBe('Year Round Template'); // Higher usage
      expect(seasonalTemplates[1].name).toBe('Summer Beach Trip');
    });

    it('should fall back to popular templates when no seasonal matches', async () => {
      const currentSeason = 'winter'; // No winter templates created
      
      let seasonalTemplates = await Template.find({
        $or: [
          { 'metadata.season': currentSeason },
          { 'metadata.season': 'all' }
        ],
        isPublic: true
      }).sort({ usageCount: -1 });

      if (seasonalTemplates.length === 0) {
        seasonalTemplates = await Template.find({ isPublic: true })
          .sort({ usageCount: -1 })
          .limit(5);
      }

      expect(seasonalTemplates.length).toBeGreaterThan(0);
      expect(seasonalTemplates[0].name).toBe('Year Round Template');
    });
  });

  describe('Performance and Scale Testing', () => {
    it('should handle large numbers of templates efficiently', async () => {
      // Create 50 templates
      const templates = Array(50).fill().map((_, i) => createTemplateData({
        name: `Performance Template ${i}`,
        type: 'system',
        category: i % 6 === 0 ? 'shopping' : 'travel', // Mix categories
        items: [{ name: `Item ${i}`, defaultPrice: i }],
        usageCount: Math.floor(Math.random() * 100),
        rating: Math.floor(Math.random() * 5) + 1,
        metadata: { tags: [`tag${i % 10}`] }
      }));

      const start = Date.now();
      await Template.insertMany(templates);
      const insertTime = Date.now() - start;

      // Test search performance
      const searchStart = Date.now();
      const searchResults = await Template.findPopular(10);
      const searchTime = Date.now() - searchStart;

      // Test category aggregation performance
      const aggStart = Date.now();
      const categories = await Template.aggregate([
        { $match: { type: 'system' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      const aggTime = Date.now() - aggStart;

      expect(searchResults).toHaveLength(10);
      expect(categories.length).toBeGreaterThan(0);
      
      // Performance assertions (generous limits for CI environments)
      expect(insertTime).toBeLessThan(5000); // 5 seconds
      expect(searchTime).toBeLessThan(1000);  // 1 second
      expect(aggTime).toBeLessThan(1000);     // 1 second

      console.log(`Performance Test Results:
        Insert Time: ${insertTime}ms
        Search Time: ${searchTime}ms
        Aggregation Time: ${aggTime}ms`);
    });

    it('should handle complex queries efficiently', async () => {
      // Create templates with various combinations
      await Template.insertMany([
        createTemplateData({
          name: 'Complex Query Test 1',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'Item 1' }],
          usageCount: 50,
          rating: 5,
          metadata: { tags: ['complex', 'test'], season: ['spring'] }
        }),
        createTemplateData({
          name: 'Complex Query Test 2',
          type: 'user',
          category: 'shopping',
          userId: user1._id,
          isPublic: true,
          items: [{ name: 'Item 2' }],
          usageCount: 30,
          rating: 4,
          metadata: { tags: ['complex', 'user'], season: ['summer'] }
        })
      ]);

      const start = Date.now();
      
      // Complex query with multiple conditions
      const complexResults = await Template.find({
        $and: [
          {
            $or: [
              { type: 'system' },
              { userId: user1._id, type: 'user', isPublic: true }
            ]
          },
          { category: 'shopping' },
          { 'metadata.tags': { $in: ['complex'] } },
          { usageCount: { $gte: 20 } },
          { rating: { $gte: 4 } }
        ]
      }).sort({ usageCount: -1, rating: -1 });

      const queryTime = Date.now() - start;

      expect(complexResults).toHaveLength(2);
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Consistency and Integrity', () => {
    it('should maintain referential integrity', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Integrity Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: [{ name: 'Integrity Item' }]
      }));

      const checklist = await Checklist.create({
        title: 'Integrity Checklist',
        userId: user1._id,
        items: [{ name: 'Integrity Item', price: 10.00 }],
        templateId: template._id
      });

      // Verify relationships
      const foundTemplate = await Template.findById(template._id);
      const foundChecklist = await Checklist.findById(checklist._id);

      expect(foundTemplate.userId).toEqual(user1._id);
      expect(foundChecklist.templateId).toEqual(template._id);
      expect(foundChecklist.userId).toEqual(foundTemplate.userId);
    });

    it('should handle cascading operations correctly', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Cascade Template',
        type: 'user',
        category: 'shopping',
        userId: user1._id,
        items: [{ name: 'Cascade Item' }]
      }));

      // Create multiple checklists from template
      const checklists = await Promise.all([
        Checklist.create({
          title: 'Cascade Checklist 1',
          userId: user1._id,
          items: [{ name: 'Cascade Item', price: 10.00 }],
          templateId: template._id
        }),
        Checklist.create({
          title: 'Cascade Checklist 2',
          userId: user1._id,
          items: [{ name: 'Cascade Item', price: 10.00 }],
          templateId: template._id
        })
      ]);

      // Update usage count
      await template.incrementUsage();
      await template.incrementUsage();

      // Verify all related data
      const updatedTemplate = await Template.findById(template._id);
      const relatedChecklists = await Checklist.find({ templateId: template._id });

      expect(updatedTemplate.usageCount).toBe(2);
      expect(relatedChecklists).toHaveLength(2);
      expect(relatedChecklists.every(cl => cl.templateId.equals(template._id))).toBe(true);
    });

    it('should validate data consistency across operations', async () => {
      const template = await Template.create(createTemplateData({
        name: 'Consistency Template',
        type: 'system',
        category: 'shopping',
        items: [
          { name: 'Item 1', defaultPrice: 10.00, isOptional: false },
          { name: 'Item 2', defaultPrice: 5.00, isOptional: true }
        ]
      }));

      // Test that virtual properties are consistent with stored data
      expect(template.calculatedEstimatedTotal).toBe(15.00);
      expect(template.calculateEstimatedTotal(false)).toBe(10.00);
      expect(template.metadata.estimatedTotal).toBe(10.00); // Only required items

      // Verify item categorization
      expect(template.requiredItems).toHaveLength(1);
      expect(template.optionalItems).toHaveLength(1);
      expect(template.requiredItems[0].name).toBe('Item 1');
      expect(template.optionalItems[0].name).toBe('Item 2');
    });
  });
});