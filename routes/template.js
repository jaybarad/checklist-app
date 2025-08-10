const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    validateTemplate,
    getAllTemplates,
    getTemplateCategories,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    rateTemplate,
    getSmartSuggestions,
    saveChecklistAsTemplate
} = require('../controllers/templateController');

// GET /api/templates - List all available templates (system + user's own)
// Query parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20, max: 100)
// - category: Filter by category (shopping, travel, moving, event, routine, custom)
// - type: Filter by type (system, user)
// - search: Search in name, description, tags
// - sort: Sort order (popular, newest, oldest, rating, name)
router.get('/api/templates', protect, getAllTemplates);

// GET /api/templates/categories - Get template categories with counts
router.get('/api/templates/categories', protect, getTemplateCategories);

// GET /api/templates/suggestions - Get smart suggestions based on context
// Query parameters:
// - context: Context for suggestions (optional)
// - limit: Number of suggestions (default: 5, max: 10)
router.get('/api/templates/suggestions', protect, getSmartSuggestions);

// GET /api/templates/:id - Get specific template details
router.get('/api/templates/:id', protect, getTemplateById);

// POST /api/templates - Create user template
// Body should contain:
// {
//   "name": "Template Name",
//   "description": "Template Description",
//   "category": "shopping|travel|moving|event|routine|custom",
//   "icon": "fas fa-icon-name", (optional)
//   "isPublic": false, (optional)
//   "items": [
//     {
//       "name": "Item Name",
//       "defaultPrice": 0,
//       "category": "Item Category", (optional)
//       "isOptional": false,
//       "alternatives": [ (optional)
//         {
//           "name": "Alternative Name",
//           "price": 0
//         }
//       ]
//     }
//   ],
//   "metadata": { (optional)
//     "season": ["spring", "summer", "fall", "winter", "all"],
//     "duration": "quick|short|medium|long|extended",
//     "difficulty": "beginner|intermediate|advanced",
//     "tags": ["tag1", "tag2"]
//   }
// }
router.post('/api/templates', protect, validateTemplate, createTemplate);

// PUT /api/templates/:id - Update user template
// Same body structure as POST, only template owner can update
router.put('/api/templates/:id', protect, validateTemplate, updateTemplate);

// DELETE /api/templates/:id - Delete user template
// Only template owner can delete
router.delete('/api/templates/:id', protect, deleteTemplate);

// POST /api/templates/:id/use - Create checklist from template with customizations
// Body should contain:
// {
//   "title": "Checklist Title",
//   "selectedItems": ["itemId1", "itemId2"], (optional, if empty uses all required items)
//   "customizations": { (optional)
//     "itemId": {
//       "name": "Custom Name",
//       "price": 123.45
//     }
//   },
//   "categoryId": "categoryId" (optional)
// }
router.post('/api/templates/:id/use', protect, useTemplate);

// POST /api/templates/:id/rate - Rate a template
// Body should contain:
// {
//   "rating": 1-5 (integer)
// }
router.post('/api/templates/:id/rate', protect, rateTemplate);

// POST /api/checklists/:id/save-as-template - Save existing checklist as template
// Body should contain:
// {
//   "templateName": "Template Name",
//   "templateDescription": "Description", (optional)
//   "templateCategory": "shopping|travel|moving|event|routine|custom",
//   "isPublic": false, (optional)
//   "metadata": { (optional)
//     "season": ["spring", "summer", "fall", "winter", "all"],
//     "duration": "quick|short|medium|long|extended",
//     "difficulty": "beginner|intermediate|advanced",
//     "tags": ["tag1", "tag2"]
//   }
// }
router.post('/api/checklists/:id/save-as-template', protect, saveChecklistAsTemplate);

module.exports = router;