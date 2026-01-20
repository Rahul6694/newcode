import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Feature: atce-driver-app, Property 1: Project structure validation
 * 
 * This property test validates that the project structure is correctly initialized
 * and contains all necessary files and directories for a React Native TypeScript project.
 */

describe('Project Structure Properties', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  it('should have all required configuration files', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Essential configuration files that must exist
        const requiredFiles = [
          'package.json',
          'tsconfig.json',
          'babel.config.js',
          'metro.config.js',
          'jest.config.js',
          'index.js',
          'app.json'
        ];

        for (const file of requiredFiles) {
          const filePath = path.join(projectRoot, '..', file);
          expect(fs.existsSync(filePath)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have valid package.json structure', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const packageJsonPath = path.join(projectRoot, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Required package.json fields
        expect(packageJson.name).toBeDefined();
        expect(packageJson.version).toBeDefined();
        expect(packageJson.scripts).toBeDefined();
        expect(packageJson.dependencies).toBeDefined();
        expect(packageJson.devDependencies).toBeDefined();

        // Required scripts
        const requiredScripts = ['start', 'test', 'android', 'ios'];
        for (const script of requiredScripts) {
          expect(packageJson.scripts[script]).toBeDefined();
        }

        // Required dependencies
        const requiredDeps = ['react', 'react-native', 'zustand'];
        for (const dep of requiredDeps) {
          expect(packageJson.dependencies[dep]).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have proper TypeScript configuration', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const tsconfigPath = path.join(projectRoot, '..', 'tsconfig.json');
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

        // Required TypeScript configuration
        expect(tsconfig.compilerOptions).toBeDefined();
        expect(tsconfig.compilerOptions.strict).toBe(true);
        expect(tsconfig.compilerOptions.baseUrl).toBeDefined();
        expect(tsconfig.compilerOptions.paths).toBeDefined();
        expect(tsconfig.include).toBeDefined();
        expect(tsconfig.exclude).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should have required source directory structure', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const srcPath = path.join(projectRoot);
        expect(fs.existsSync(srcPath)).toBe(true);

        // Required source files
        const requiredFiles = ['App.tsx', 'types/index.ts'];
        for (const file of requiredFiles) {
          const filePath = path.join(srcPath, file);
          expect(fs.existsSync(filePath)).toBe(true);
        }

        // Required source directories should exist or be creatable
        const requiredDirs = [
          'navigation',
          'screens', 
          'services',
          'store'
        ];

        for (const dir of requiredDirs) {
          const dirPath = path.join(srcPath, dir);
          expect(fs.existsSync(dirPath)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have valid Jest configuration', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const jestConfigPath = path.join(projectRoot, '..', 'jest.config.js');
        expect(fs.existsSync(jestConfigPath)).toBe(true);

        // Jest setup file should exist
        const jestSetupPath = path.join(projectRoot, '..', 'jest.setup.js');
        expect(fs.existsSync(jestSetupPath)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});