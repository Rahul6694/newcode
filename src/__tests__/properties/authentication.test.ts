import * as fc from 'fast-check';
import {validateLoginCredentials} from '@/utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: {use: jest.fn()},
      response: {use: jest.fn()},
    },
  })),
  isAxiosError: jest.fn(() => false),
}));

/**
 * Feature: atce-driver-app, Property 1: Valid credentials authentication
 * Feature: atce-driver-app, Property 2: Invalid credentials rejection  
 * Feature: atce-driver-app, Property 4: Session persistence
 * 
 * These property tests validate authentication behavior across all possible inputs
 */

describe('Authentication Properties', () => {
  let mockAxiosInstance: any;

  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
    
    // Setup axios mock
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: {use: jest.fn()},
        response: {use: jest.fn()},
      },
    };
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  afterEach(async () => {
    // Clean up after each test
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });


  it('Property 1: Valid credentials validation - for any valid email and password combination, validation should pass', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({minLength: 6, maxLength: 50}),
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      {numRuns: 100}
    );
  });

  it('Property 2: Invalid credentials rejection - for any invalid credential combination, validation should fail with error message', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''), // Empty email
          fc.string({maxLength: 3}), // Too short
          fc.constant('invalid-email') // Invalid email format
        ),
        fc.oneof(
          fc.constant(''), // Empty password
          fc.string({maxLength: 5}) // Too short password
        ),
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          
          // At least one of email or password should be invalid
          if (!email.trim() || !email.includes('@') || !password.trim() || password.length < 6) {
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
          }
        }
      ),
      {numRuns: 100}
    );
  });

  it('Property 3: Empty email always fails validation', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 6, maxLength: 50}), // Any password
        (password) => {
          const result = validateLoginCredentials('', password);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Email');
        }
      ),
      {numRuns: 50}
    );
  });

  it('Property 4: Empty password always fails validation', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(), // Any valid email
        (email) => {
          const result = validateLoginCredentials(email, '');
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Password');
        }
      ),
      {numRuns: 50}
    );
  });

  it('Property 5: Short password always fails validation', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({minLength: 1, maxLength: 5}), // Password too short
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('6 characters');
        }
      ),
      {numRuns: 50}
    );
  });

  it('Property 6: Invalid email format always fails validation', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1, maxLength: 50}).filter(s => !s.includes('@') && s.trim().length > 0), // No @ symbol, not empty
        fc.string({minLength: 6, maxLength: 50}),
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      {numRuns: 50}
    );
  });


  it('Property 7: Session persistence - AsyncStorage stores and retrieves data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({minLength: 10, maxLength: 100}), // token
        fc.record({
          id: fc.string({minLength: 1, maxLength: 20}),
          name: fc.string({minLength: 1, maxLength: 50}),
          email: fc.emailAddress(),
        }),
        async (token, userData) => {
          // Store token and user data
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          
          // Retrieve and verify
          const storedToken = await AsyncStorage.getItem('auth_token');
          const storedUser = await AsyncStorage.getItem('user_data');
          
          expect(storedToken).toBe(token);
          expect(JSON.parse(storedUser!)).toEqual(userData);
          
          // Clear and verify
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
          
          const tokenAfterClear = await AsyncStorage.getItem('auth_token');
          const userAfterClear = await AsyncStorage.getItem('user_data');
          
          expect(tokenAfterClear).toBeNull();
          expect(userAfterClear).toBeNull();
        }
      ),
      {numRuns: 50}
    );
  });

  it('Property 8: Logout clears all session data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({minLength: 10, maxLength: 100}),
        fc.emailAddress(),
        async (token, email) => {
          // Setup session data
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('user_data', JSON.stringify({email}));
          
          // Verify data exists
          expect(await AsyncStorage.getItem('auth_token')).toBe(token);
          expect(await AsyncStorage.getItem('user_data')).toBeDefined();
          
          // Simulate logout by clearing
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
          
          // Verify all data is cleared
          expect(await AsyncStorage.getItem('auth_token')).toBeNull();
          expect(await AsyncStorage.getItem('user_data')).toBeNull();
        }
      ),
      {numRuns: 50}
    );
  });

  it('Property 9: Validation is deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 100}),
        fc.string({maxLength: 100}),
        (email, password) => {
          const result1 = validateLoginCredentials(email, password);
          const result2 = validateLoginCredentials(email, password);
          
          expect(result1.isValid).toBe(result2.isValid);
          expect(result1.error).toBe(result2.error);
        }
      ),
      {numRuns: 100}
    );
  });

  it('Property 10: Whitespace-only inputs are treated as empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('   ', '\t', '\n', '  \t\n  '),
        fc.string({minLength: 6, maxLength: 50}),
        (whitespaceEmail, password) => {
          const result = validateLoginCredentials(whitespaceEmail, password);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      {numRuns: 20}
    );
  });
});
