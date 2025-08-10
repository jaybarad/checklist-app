# Template Testing Documentation

This directory contains comprehensive tests for the Smart Templates feature of the checklist application.

## Test Structure

### Core Test Files

1. **templateModel.test.js** - Unit tests for the Template model
2. **templateController.test.js** - Unit tests for template controller functions
3. **templateIntegration.test.js** - Integration tests between templates, users, and checklists
4. **testUtils.js** - Shared test utilities and helper functions
5. **setup.js** - Test environment setup and teardown

## Test Coverage

### Model Tests (`templateModel.test.js`)

#### Schema Validation Tests
- ✅ Valid system template creation
- ✅ Valid user template creation
- ✅ Required field validation
- ✅ Invalid category/type validation
- ✅ User ID requirement for user templates
- ✅ Template items validation
- ✅ Enum field validation (metadata)
- ✅ Rating range validation
- ✅ Item name length validation
- ✅ Negative price validation

#### Instance Methods Tests
- ✅ `calculateEstimatedTotal()` with/without optional items
- ✅ `incrementUsage()` single and multiple increments
- ✅ `getItemAlternatives()` with existing and non-existent items
- ✅ Case sensitivity handling

#### Virtual Properties Tests
- ✅ `calculatedEstimatedTotal` calculation
- ✅ `requiredItems` filtering
- ✅ `optionalItems` filtering
- ✅ Edge cases (no optional/required items)

#### Static Methods Tests
- ✅ `findPopular()` with limits and categories
- ✅ `findByCategory()` with privacy settings
- ✅ `searchTemplates()` by name, description, tags
- ✅ `getSystemTemplates()` with/without category filter
- ✅ `getUserTemplates()` with sorting
- ✅ Privacy respect in search results

#### Middleware Tests
- ✅ Pre-save estimated total calculation
- ✅ User ID removal for system templates
- ✅ Tag filtering (empty/whitespace removal)
- ✅ Items modification handling

#### Edge Cases
- ✅ Maximum length handling
- ✅ Many items performance
- ✅ Zero price items
- ✅ Complex alternatives
- ✅ Concurrent operations

### Controller Tests (`templateController.test.js`)

#### Input Validation Tests
- ✅ Valid template data validation
- ✅ Missing/invalid field validation
- ✅ Name length validation
- ✅ Category validation
- ✅ Items validation (empty, too many, missing names)
- ✅ Price validation (negative values)
- ✅ Alternative items validation
- ✅ Metadata validation (season, duration, difficulty, tags)

#### Error Handling Tests
- ✅ Database connection errors
- ✅ Validation errors
- ✅ Cast errors (invalid ObjectId)
- ✅ Authorization errors (private template access)
- ✅ Update/delete permission errors
- ✅ Not found errors

#### Business Logic Tests
- ✅ Template usage (checklist creation)
- ✅ Item selection and customization
- ✅ Usage count incrementing
- ✅ Template rating (validation and persistence)
- ✅ Smart suggestions (seasonal and popular)
- ✅ Category statistics aggregation

### Integration Tests (`templateIntegration.test.js`)

#### Template-Checklist Conversion
- ✅ Template to checklist conversion
- ✅ Customization handling
- ✅ Relationship maintenance
- ✅ Checklist to template conversion
- ✅ User ownership preservation

#### Usage Tracking
- ✅ Usage statistics accuracy
- ✅ Concurrent usage handling
- ✅ Multiple user scenarios

#### Search and Filter Integration
- ✅ Multi-field search (name, description, tags)
- ✅ Category filtering
- ✅ Privacy settings respect
- ✅ Result sorting by relevance

#### Seasonal Suggestions
- ✅ Seasonal template matching
- ✅ Fallback to popular templates
- ✅ Dynamic season handling

#### Performance Testing
- ✅ Large dataset handling (50+ templates)
- ✅ Complex query performance
- ✅ Search and aggregation timing

#### Data Consistency
- ✅ Referential integrity maintenance
- ✅ Cascading operations
- ✅ Virtual property consistency
- ✅ Cross-operation data validation

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is running locally or set up test database connection in `.env.test`

3. Create test environment file:
```bash
# .env.test
MONGO_URI_TEST=mongodb://localhost:27017/checklist_app_test
JWT_SECRET=test-jwt-secret-key
NODE_ENV=test
```

### Test Commands

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test file
npx jest test/templateModel.test.js

# Run tests with verbose output
npx jest --verbose

# Run tests with coverage report
npx jest --coverage
```

### Test Database

Tests use a separate test database (`checklist_app_test` by default) to avoid interfering with development data. The test setup:

- Connects to test database before all tests
- Clears all collections after each test
- Closes database connection after all tests
- Uses real MongoDB (not in-memory) for full integration testing

## Test Data Management

### Test Utilities (`testUtils.js`)

- **`createTestUser()`** - Creates unique test users
- **`generateAuthToken()`** - Generates JWT tokens for authentication
- **`authenticatedRequest()`** - Creates authenticated HTTP requests
- **`createTemplateData()`** - Factory for template test data
- **`validateTemplateStructure()`** - Validates template object structure
- **`validateChecklistStructure()`** - Validates checklist object structure

### Mock Data Patterns

```javascript
// Template data factory usage
const templateData = createTemplateData({
  name: 'Custom Template Name',
  category: 'shopping',
  items: [
    { name: 'Custom Item', defaultPrice: 15.00 }
  ]
});

// User creation
const user = await createTestUser({
  name: 'Custom User Name',
  email: 'custom@example.com'
});
```

## Test Organization Principles

1. **Isolation** - Each test is independent and can run alone
2. **Cleanup** - Database is cleaned after each test
3. **Realistic Data** - Tests use realistic data scenarios
4. **Edge Cases** - Comprehensive edge case coverage
5. **Performance** - Performance benchmarks included
6. **Error Handling** - All error paths tested

## Coverage Goals

- **Model Coverage**: 100% of methods, validations, and middleware
- **Controller Coverage**: 90%+ of business logic and error handling
- **Integration Coverage**: All major user workflows
- **Edge Cases**: Common and uncommon edge cases covered

## Continuous Integration

Tests are designed to run in CI environments:
- No external service dependencies (beyond MongoDB)
- Configurable timeouts for slower environments
- Comprehensive error reporting
- Coverage reporting integration

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Port Conflicts**: Test database should use different port/name
3. **Timeout Issues**: Increase Jest timeout for slower systems
4. **Memory Issues**: Large dataset tests may require more memory

### Debug Commands

```bash
# Run with debug output
DEBUG=* npm test

# Run single test with full output
npx jest test/templateModel.test.js --verbose --no-coverage

# Check test database connection
node -e "require('./test/setup.js')"
```

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Use test utilities for common operations
3. Include both positive and negative test cases
4. Add performance considerations for large data operations
5. Update this documentation for new test categories