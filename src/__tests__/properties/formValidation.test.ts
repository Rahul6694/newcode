import * as fc from 'fast-check';
import {validateLoginCredentials, validatePasswordChange, isValidEmail, isValidPassword} from '@/utils/validation';

/**
 * Feature: atce-driver-app, Property 3: Form validation completeness
 * 
 * This property test validates that form validation correctly handles all possible
 * combinations of email and password inputs according to the requirements.
 */

describe('Form Validation Properties', () => {
  it('Property 3: Form validation completeness - for any combination of empty or filled email/password fields, login should only be allowed when both fields are completed and valid', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''), // Empty string
          fc.string({maxLength: 100}), // Any string
          fc.emailAddress() // Valid email
        ),
        fc.oneof(
          fc.constant(''), // Empty string
          fc.string({maxLength: 100}) // Any string
        ),
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          
          // Login should only be valid when:
          // 1. Email is not empty AND is a valid email format
          // 2. Password is not empty AND is at least 6 characters
          const shouldBeValid = 
            email.trim() !== '' && 
            isValidEmail(email) && 
            password.trim() !== '' && 
            isValidPassword(password);
          
          expect(result.isValid).toBe(shouldBeValid);
          
          if (!shouldBeValid) {
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Email validation consistency - for any string, email validation should be consistent and follow RFC standards', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 100}),
        (email) => {
          const isValid = isValidEmail(email);
          
          // Basic email validation rules
          if (isValid) {
            expect(email).toContain('@');
            expect(email).toContain('.');
            expect(email.trim()).toBe(email); // No leading/trailing spaces
            expect(email.split('@')).toHaveLength(2); // Exactly one @
          }
          
          // Empty strings should always be invalid
          if (email.trim() === '') {
            expect(isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Password validation consistency - for any string, password validation should enforce minimum length requirement', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 100}),
        (password) => {
          const isValid = isValidPassword(password);
          
          // Password should be valid if and only if it's at least 6 characters
          expect(isValid).toBe(password.length >= 6);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Password change validation - for any password change attempt, all validation rules should be enforced', () => {
    fc.assert(
      fc.property(
        fc.string({maxLength: 50}), // current password
        fc.string({maxLength: 50}), // new password
        fc.string({maxLength: 50}), // confirm password
        (currentPassword, newPassword, confirmPassword) => {
          const result = validatePasswordChange(currentPassword, newPassword, confirmPassword);
          
          // Password change should be valid if and only if:
          // 1. Current password is not empty
          // 2. New password is not empty AND at least 6 characters
          // 3. Confirm password matches new password
          // 4. New password is different from current password
          const shouldBeValid = 
            currentPassword.trim() !== '' &&
            newPassword.trim() !== '' &&
            newPassword.length >= 6 &&
            confirmPassword.trim() !== '' &&
            newPassword === confirmPassword &&
            currentPassword !== newPassword;
          
          expect(result.isValid).toBe(shouldBeValid);
          
          if (!shouldBeValid) {
            expect(result.error).toBeDefined();
            expect(typeof result.error).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Validation error messages are informative - for any invalid input, error messages should provide clear guidance', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''), // Empty email
          fc.string({minLength: 1, maxLength: 10}).filter(s => !s.includes('@')), // Invalid email
        ),
        fc.oneof(
          fc.constant(''), // Empty password
          fc.string({maxLength: 5}) // Too short password
        ),
        (email, password) => {
          const result = validateLoginCredentials(email, password);
          
          if (!result.isValid) {
            expect(result.error).toBeDefined();
            expect(result.error!.length).toBeGreaterThan(0);
            
            // Error message should be helpful
            const errorLower = result.error!.toLowerCase();
            
            if (email.trim() === '') {
              expect(errorLower).toContain('email');
              expect(errorLower).toContain('required');
            } else if (!isValidEmail(email)) {
              expect(errorLower).toContain('email');
              expect(errorLower).toContain('valid');
            }
            
            if (password.trim() === '') {
              expect(errorLower).toContain('password');
              expect(errorLower).toContain('required');
            } else if (password.length < 6) {
              expect(errorLower).toContain('password');
              expect(errorLower).toContain('6');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Input sanitization - for any input with whitespace, validation should handle trimming consistently', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({minLength: 6, maxLength: 20}),
        fc.nat({max: 5}), // Leading spaces
        fc.nat({max: 5}), // Trailing spaces
        (email, password, leadingSpaces, trailingSpaces) => {
          const paddedEmail = ' '.repeat(leadingSpaces) + email + ' '.repeat(trailingSpaces);
          const paddedPassword = ' '.repeat(leadingSpaces) + password + ' '.repeat(trailingSpaces);
          
          const result = validateLoginCredentials(paddedEmail, paddedPassword);
          const cleanResult = validateLoginCredentials(email, password);
          
          // Validation should be the same for padded and clean inputs
          expect(result.isValid).toBe(cleanResult.isValid);
        }
      ),
      { numRuns: 100 }
    );
  });
});