const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
const Checklist = require('../models/Checklist');
const templateController = require('../controllers/templateController');
const { createTestUser, createTemplateData } = require('./testUtils');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (overrides = {}) => {
  return {
    user: { userId: new mongoose.Types.ObjectId() },
    params: {},
    query: {},
    body: {},
    ...overrides
  };
};

describe('Template Controller Unit Tests', () => {
  let user1, user2;

  beforeEach(async () => {
    user1 = await createTestUser();
    user2 = await createTestUser();
  });

  describe('Input Validation', () => {
    describe('validateTemplate middleware', () => {
      it('should pass validation for valid template data', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item', defaultPrice: 10.00 }],
            metadata: {
              season: ['spring'],
              duration: 'medium',
              difficulty: 'beginner',
              tags: ['test']
            }
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should fail validation for missing name', () => {
        const req = mockRequest({
          body: {
            category: 'shopping',
            items: [{ name: 'Valid Item' }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            name: 'Template name is required'
          })
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should fail validation for short name', () => {
        const req = mockRequest({
          body: {
            name: 'AB', // Too short
            category: 'shopping',
            items: [{ name: 'Valid Item' }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            name: 'Template name must be at least 3 characters'
          })
        });
      });

      it('should fail validation for long name', () => {
        const req = mockRequest({
          body: {
            name: 'A'.repeat(101), // Too long
            category: 'shopping',
            items: [{ name: 'Valid Item' }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            name: 'Template name cannot exceed 100 characters'
          })
        });
      });

      it('should fail validation for invalid category', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'invalid_category',
            items: [{ name: 'Valid Item' }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            category: 'Invalid category selection'
          })
        });
      });

      it('should fail validation for empty items', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: []
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            items: 'Template must have at least one item'
          })
        });
      });

      it('should fail validation for too many items', () => {
        const manyItems = Array(101).fill().map((_, i) => ({ name: `Item ${i}` }));
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: manyItems
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            items: 'Maximum 100 items allowed'
          })
        });
      });

      it('should fail validation for item without name', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ defaultPrice: 10.00 }] // Missing name
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'items[0].name': 'Item name is required'
          })
        });
      });

      it('should fail validation for negative item price', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item', defaultPrice: -5.00 }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'items[0].defaultPrice': 'Invalid price value'
          })
        });
      });

      it('should validate alternative items', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{
              name: 'Valid Item',
              alternatives: [
                { name: 'Valid Alt', price: 10.00 },
                { price: 15.00 } // Missing name
              ]
            }]
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'items[0].alternatives[1].name': 'Alternative name is required'
          })
        });
      });

      it('should validate metadata season', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item' }],
            metadata: {
              season: ['invalid_season']
            }
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'metadata.season': 'Invalid season value'
          })
        });
      });

      it('should validate metadata duration', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item' }],
            metadata: {
              duration: 'invalid_duration'
            }
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'metadata.duration': 'Invalid duration value'
          })
        });
      });

      it('should validate metadata difficulty', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item' }],
            metadata: {
              difficulty: 'invalid_difficulty'
            }
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'metadata.difficulty': 'Invalid difficulty value'
          })
        });
      });

      it('should validate metadata tags', () => {
        const req = mockRequest({
          body: {
            name: 'Valid Template',
            category: 'shopping',
            items: [{ name: 'Valid Item' }],
            metadata: {
              tags: ['valid-tag', 'A'.repeat(31)] // Second tag too long
            }
          }
        });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.objectContaining({
            'metadata.tags[1]': 'Tag must be a string with maximum 30 characters'
          })
        });
      });
    });

    describe('Data Sanitization', () => {
      it('should sanitize template data correctly', () => {
        // This would require access to the sanitizeTemplateData function
        // Since it's not exported, we'll test it indirectly through the controller
        const sampleData = {
          name: '  Trimmed Template  ',
          description: '  Trimmed Description  ',
          category: 'shopping',
          isPublic: 'true', // Should be converted to boolean
          items: [{
            name: '  Trimmed Item  ',
            defaultPrice: '10.50', // Should be converted to number
            alternatives: [{
              name: '  Trimmed Alt  ',
              price: '15.75'
            }]
          }],
          metadata: {
            tags: ['  trimmed-tag  ', '', '  another-tag  ']
          }
        };

        // Test sanitization indirectly by ensuring it doesn't cause validation errors
        const req = mockRequest({ body: sampleData });
        const res = mockResponse();
        const next = jest.fn();

        templateController.validateTemplate(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });
    });
  });

  describe('Error Handling', () => {
    describe('Database Errors', () => {
      it('should handle database connection errors gracefully', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          query: {}
        });
        const res = mockResponse();

        // Mock mongoose to throw an error
        const originalFind = Template.find;
        Template.find = jest.fn().mockRejectedValue(new Error('Database connection failed'));

        await templateController.getAllTemplates(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Failed to fetch templates'
        });

        // Restore original method
        Template.find = originalFind;
      });

      it('should handle validation errors on template creation', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          body: {
            name: 'Test Template',
            category: 'shopping',
            items: [{ name: 'Test Item' }]
          }
        });
        const res = mockResponse();

        // Mock save to throw validation error
        const mockTemplate = {
          save: jest.fn().mockRejectedValue({
            name: 'ValidationError',
            errors: {
              name: { message: 'Name is required' },
              category: { message: 'Invalid category' }
            }
          })
        };

        const originalTemplate = Template;
        Template.prototype.constructor = jest.fn().mockReturnValue(mockTemplate);

        await templateController.createTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: {
            name: 'Name is required',
            category: 'Invalid category'
          }
        });
      });

      it('should handle cast errors (invalid ObjectId)', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: 'invalid-object-id' }
        });
        const res = mockResponse();

        await templateController.getTemplateById(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Invalid template ID format'
        });
      });
    });

    describe('Authorization Errors', () => {
      let template;

      beforeEach(async () => {
        template = await Template.create(createTemplateData({
          name: 'Private Template',
          type: 'user',
          category: 'shopping',
          userId: user1._id,
          isPublic: false,
          items: [{ name: 'Private Item' }]
        }));
      });

      it('should deny access to private templates', async () => {
        const req = mockRequest({
          user: { userId: user2._id },
          params: { id: template._id.toString() }
        });
        const res = mockResponse();

        await templateController.getTemplateById(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Access denied to this template'
        });
      });

      it('should prevent updating other user templates', async () => {
        const req = mockRequest({
          user: { userId: user2._id },
          params: { id: template._id.toString() },
          body: {
            name: 'Hacked Template',
            category: 'shopping',
            items: [{ name: 'Hacked Item' }]
          }
        });
        const res = mockResponse();

        await templateController.updateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'You can only update your own templates'
        });
      });

      it('should prevent deleting other user templates', async () => {
        const req = mockRequest({
          user: { userId: user2._id },
          params: { id: template._id.toString() }
        });
        const res = mockResponse();

        await templateController.deleteTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'You can only delete your own templates'
        });
      });

      it('should prevent updating system templates', async () => {
        const systemTemplate = await Template.create(createTemplateData({
          name: 'System Template',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'System Item' }]
        }));

        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: systemTemplate._id.toString() },
          body: {
            name: 'Hacked System Template',
            category: 'shopping',
            items: [{ name: 'Hacked Item' }]
          }
        });
        const res = mockResponse();

        await templateController.updateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'You can only update your own templates'
        });
      });
    });

    describe('Not Found Errors', () => {
      it('should return 404 for non-existent template', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: fakeId.toString() }
        });
        const res = mockResponse();

        await templateController.getTemplateById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Template not found'
        });
      });

      it('should return 404 when updating non-existent template', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: fakeId.toString() },
          body: {
            name: 'Updated Template',
            category: 'shopping',
            items: [{ name: 'Updated Item' }]
          }
        });
        const res = mockResponse();

        await templateController.updateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Template not found'
        });
      });
    });
  });

  describe('Business Logic', () => {
    describe('Template Usage', () => {
      let template;

      beforeEach(async () => {
        template = await Template.create(createTemplateData({
          name: 'Usage Test Template',
          type: 'system',
          category: 'shopping',
          items: [
            { name: 'Required Item', defaultPrice: 10.00, isOptional: false },
            { name: 'Optional Item', defaultPrice: 5.00, isOptional: true }
          ]
        }));
      });

      it('should create checklist from template with all required items', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: {
            title: 'My Test Checklist'
          }
        });
        const res = mockResponse();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await templateController.useTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Checklist created from template successfully'
          })
        );

        // Verify template usage count was incremented
        const updatedTemplate = await Template.findById(template._id);
        expect(updatedTemplate.usageCount).toBe(1);
      });

      it('should create checklist with selected items', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: {
            title: 'Selective Checklist',
            selectedItems: [template.items[0]._id.toString()],
            customizations: {
              [template.items[0]._id.toString()]: {
                name: 'Custom Name',
                price: 15.00
              }
            }
          }
        });
        const res = mockResponse();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await templateController.useTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        
        const responseCall = res.json.mock.calls[0][0];
        expect(responseCall.success).toBe(true);
        expect(responseCall.data.items).toHaveLength(1);
        expect(responseCall.data.items[0].name).toBe('Custom Name');
        expect(responseCall.data.items[0].price).toBe(15.00);
      });

      it('should require title for checklist creation', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: {}
        });
        const res = mockResponse();

        await templateController.useTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Checklist title is required'
        });
      });

      it('should handle empty item selection', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: {
            title: 'Empty Selection',
            selectedItems: []
          }
        });
        const res = mockResponse();
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();

        await templateController.useTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        
        // Should create checklist with required items only
        const responseCall = res.json.mock.calls[0][0];
        expect(responseCall.data.items).toHaveLength(1);
        expect(responseCall.data.items[0].name).toBe('Required Item');
      });
    });

    describe('Template Rating', () => {
      let template;

      beforeEach(async () => {
        template = await Template.create(createTemplateData({
          name: 'Rating Test Template',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'Rating Item' }]
        }));
      });

      it('should rate a template successfully', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: { rating: 4 }
        });
        const res = mockResponse();

        await templateController.rateTemplate(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { rating: 4 },
          message: 'Template rated successfully'
        });

        // Verify rating was saved
        const updatedTemplate = await Template.findById(template._id);
        expect(updatedTemplate.rating).toBe(4);
      });

      it('should validate rating range', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: { rating: 6 }
        });
        const res = mockResponse();

        await templateController.rateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Rating must be an integer between 1 and 5'
        });
      });

      it('should require integer rating', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: { rating: 3.5 }
        });
        const res = mockResponse();

        await templateController.rateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Rating must be an integer between 1 and 5'
        });
      });

      it('should require rating to be provided', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          params: { id: template._id.toString() },
          body: {}
        });
        const res = mockResponse();

        await templateController.rateTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: 'Rating must be an integer between 1 and 5'
        });
      });
    });

    describe('Smart Suggestions', () => {
      beforeEach(async () => {
        // Create seasonal templates for testing
        await Template.create(createTemplateData({
          name: 'Winter Template',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'Winter Item' }],
          usageCount: 50,
          rating: 5,
          metadata: { season: ['winter'] }
        }));

        await Template.create(createTemplateData({
          name: 'All Season Template',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'All Season Item' }],
          usageCount: 100,
          rating: 4,
          metadata: { season: ['all'] }
        }));

        await Template.create(createTemplateData({
          name: 'Popular Template',
          type: 'system',
          category: 'travel',
          items: [{ name: 'Popular Item' }],
          usageCount: 200,
          rating: 5
        }));
      });

      it('should get smart suggestions', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          query: { limit: '3' }
        });
        const res = mockResponse();

        await templateController.getSmartSuggestions(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.any(Array),
            context: expect.objectContaining({
              season: expect.any(String)
            })
          })
        );

        const responseCall = res.json.mock.calls[0][0];
        expect(responseCall.data.length).toBeLessThanOrEqual(3);
      });

      it('should handle limit parameter', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          query: { limit: '1' }
        });
        const res = mockResponse();

        await templateController.getSmartSuggestions(req, res);

        const responseCall = res.json.mock.calls[0][0];
        expect(responseCall.data.length).toBeLessThanOrEqual(1);
      });

      it('should include context in response', async () => {
        const req = mockRequest({
          user: { userId: user1._id },
          query: { context: 'dashboard' }
        });
        const res = mockResponse();

        await templateController.getSmartSuggestions(req, res);

        const responseCall = res.json.mock.calls[0][0];
        expect(responseCall.context.suggestedBy).toBe('dashboard');
        expect(responseCall.context.season).toBeDefined();
      });
    });

    describe('Template Categories', () => {
      beforeEach(async () => {
        await Template.create(createTemplateData({
          name: 'Shopping Template 1',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'Item 1' }],
          rating: 5,
          usageCount: 10
        }));

        await Template.create(createTemplateData({
          name: 'Shopping Template 2',
          type: 'system',
          category: 'shopping',
          items: [{ name: 'Item 2' }],
          rating: 4,
          usageCount: 5
        }));

        await Template.create(createTemplateData({
          name: 'Travel Template',
          type: 'system',
          category: 'travel',
          items: [{ name: 'Travel Item' }],
          rating: 3,
          usageCount: 8
        }));
      });

      it('should get template categories with counts and statistics', async () => {
        const req = mockRequest({
          user: { userId: user1._id }
        });
        const res = mockResponse();

        await templateController.getTemplateCategories(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              name: 'shopping',
              count: 2,
              avgRating: 4.5,
              totalUsage: 15
            }),
            expect.objectContaining({
              name: 'travel',
              count: 1,
              avgRating: 3,
              totalUsage: 8
            })
          ])
        });
      });
    });
  });
});