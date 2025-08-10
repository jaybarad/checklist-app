const fs = require('fs');
const path = require('path');
const assert = require('assert');
const mongoose = require('mongoose');

// Simple test framework
global.describe = (name, fn) => {
  console.log(`\n📋 ${name}`);
  fn();
};

global.it = (name, fn) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`  ✓ ${name}`);
      await fn();
      resolve();
    } catch (error) {
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${error.message}`);
      reject(error);
    }
  });
};

global.beforeEach = (fn) => {
  // Store for later execution
  global._beforeEach = fn;
};

global.beforeAll = (fn) => {
  global._beforeAll = fn;
};

global.afterEach = (fn) => {
  global._afterEach = fn;
};

global.afterAll = (fn) => {
  global._afterAll = fn;
};

// Jest-like expect function
global.expect = (actual) => {
  return {
    toBe: (expected) => assert.strictEqual(actual, expected),
    toEqual: (expected) => assert.deepEqual(actual, expected),
    toBeDefined: () => assert(actual !== undefined, 'Expected value to be defined'),
    toBeUndefined: () => assert.strictEqual(actual, undefined),
    toBeNull: () => assert.strictEqual(actual, null),
    toBeTruthy: () => assert(actual, 'Expected value to be truthy'),
    toBeFalsy: () => assert(!actual, 'Expected value to be falsy'),
    toHaveLength: (expected) => assert.strictEqual(actual.length, expected),
    toHaveProperty: (prop) => assert(actual.hasOwnProperty(prop), `Expected object to have property ${prop}`),
    toContain: (expected) => assert(actual.includes(expected), `Expected ${actual} to contain ${expected}`),
    toBeGreaterThan: (expected) => assert(actual > expected, `Expected ${actual} to be greater than ${expected}`),
    toBeLessThan: (expected) => assert(actual < expected, `Expected ${actual} to be less than ${expected}`),
    toBeGreaterThanOrEqual: (expected) => assert(actual >= expected, `Expected ${actual} to be >= ${expected}`),
    toBeLessThanOrEqual: (expected) => assert(actual <= expected, `Expected ${actual} to be <= ${expected}`),
    toThrow: (expectedError) => {
      try {
        actual();
        assert.fail('Expected function to throw');
      } catch (error) {
        if (expectedError) {
          assert(error.message.includes(expectedError), `Expected error message to contain ${expectedError}`);
        }
      }
    },
    rejects: {
      toThrow: async (expectedError) => {
        try {
          await actual;
          assert.fail('Expected promise to reject');
        } catch (error) {
          if (expectedError) {
            assert(error.message.includes(expectedError), `Expected error message to contain ${expectedError}`);
          }
        }
      }
    }
  };
};

// Mock jest functions
global.jest = {
  fn: () => {
    const mockFn = function(...args) {
      mockFn.mock.calls.push(args);
      return mockFn.mock.returnValue;
    };
    mockFn.mock = {
      calls: [],
      returnValue: undefined
    };
    mockFn.mockReturnValue = (value) => {
      mockFn.mock.returnValue = value;
      return mockFn;
    };
    mockFn.mockRejectedValue = (error) => {
      mockFn.mock.returnValue = Promise.reject(error);
      return mockFn;
    };
    return mockFn;
  }
};

// Console override
global.console = {
  ...console,
  error: () => {} // Suppress error logs during tests
};

async function runTests() {
  console.log('🧪 Running Template Tests\n');
  
  // Load setup first to establish database connection
  require('./setup');
  
  // Wait a moment for database connection
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const testFiles = [
    'templateModel.basic.test.js'
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testFile of testFiles) {
    const testPath = path.join(__dirname, testFile);
    
    if (fs.existsSync(testPath)) {
      console.log(`\n📁 Running ${testFile}...`);
      
      try {
        // Clean database before each test file
        if (global.cleanupDatabase) {
          await global.cleanupDatabase();
        }
        
        // Reset globals
        global._beforeAll = null;
        global._beforeEach = null;
        global._afterEach = null;
        global._afterAll = null;
        
        // Load and run the test file
        require(testPath);
        
        // Execute setup/teardown hooks if they exist
        if (global._beforeAll) await global._beforeAll();
        if (global._afterAll) await global._afterAll();
        
        console.log(`✅ ${testFile} completed`);
        passedTests++;
      } catch (error) {
        console.log(`❌ ${testFile} failed:`, error.message);
        failedTests++;
      }
      
      totalTests++;
    }
  }

  // Close database connection
  if (global.closeDatabase) {
    await global.closeDatabase();
  }

  console.log(`\n📊 Test Summary:`);
  console.log(`   Total files: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  
  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});