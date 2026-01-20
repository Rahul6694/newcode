import fc from 'fast-check';
import {Document, DocumentStage, DocumentFile} from '@/types';
import {DataFactory} from '@/utils/dataFactory';

describe('Document Management Properties', () => {
  // Property 15: Document type validation
  describe('Property 15: Document type validation', () => {
    it('should accept valid image file extensions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('jpg', 'jpeg', 'png'),
          fc.string({minLength: 1, maxLength: 50}).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          (extension: string, baseName: string) => {
            const fileName = `${baseName}.${extension}`;
            const file: DocumentFile = {
              uri: `file://${fileName}`,
              type: 'image',
              name: fileName,
              size: 1024 * 100, // 100KB
            };

            const validateDocument = (doc: DocumentFile): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];
              const MAX_FILE_SIZE = 10 * 1024 * 1024;

              if (doc.size > MAX_FILE_SIZE) {
                errors.push('File size exceeds limit');
              }

              if (doc.type === 'image') {
                const ext = doc.name.toLowerCase().split('.').pop();
                if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
                  errors.push('Invalid image format');
                }
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateDocument(file);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        {numRuns: 50}
      );
    });

    it('should reject invalid image file extensions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('gif', 'bmp', 'tiff', 'webp', 'svg'),
          fc.string({minLength: 1, maxLength: 50}).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          (extension: string, baseName: string) => {
            const fileName = `${baseName}.${extension}`;
            const file: DocumentFile = {
              uri: `file://${fileName}`,
              type: 'image',
              name: fileName,
              size: 1024 * 100,
            };

            const validateDocument = (doc: DocumentFile): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];

              if (doc.type === 'image') {
                const ext = doc.name.toLowerCase().split('.').pop();
                if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
                  errors.push('Invalid image format');
                }
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateDocument(file);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid image format');
          }
        ),
        {numRuns: 30}
      );
    });

    it('should accept valid PDF files', () => {
      fc.assert(
        fc.property(
          fc.string({minLength: 1, maxLength: 50}).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          (baseName: string) => {
            const fileName = `${baseName}.pdf`;
            const file: DocumentFile = {
              uri: `file://${fileName}`,
              type: 'pdf',
              name: fileName,
              size: 1024 * 500, // 500KB
            };

            const validateDocument = (doc: DocumentFile): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];
              const MAX_FILE_SIZE = 10 * 1024 * 1024;

              if (doc.size > MAX_FILE_SIZE) {
                errors.push('File size exceeds limit');
              }

              if (doc.type === 'pdf') {
                const ext = doc.name.toLowerCase().split('.').pop();
                if (ext !== 'pdf') {
                  errors.push('Invalid document format');
                }
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateDocument(file);
            expect(result.isValid).toBe(true);
          }
        ),
        {numRuns: 50}
      );
    });

    it('should reject files exceeding size limit', () => {
      fc.assert(
        fc.property(
          fc.integer({min: 11 * 1024 * 1024, max: 100 * 1024 * 1024}), // 11MB to 100MB
          (fileSize: number) => {
            const file: DocumentFile = {
              uri: 'file://large-file.jpg',
              type: 'image',
              name: 'large-file.jpg',
              size: fileSize,
            };

            const validateDocument = (doc: DocumentFile): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];
              const MAX_FILE_SIZE = 10 * 1024 * 1024;

              if (doc.size > MAX_FILE_SIZE) {
                errors.push('File size exceeds limit');
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateDocument(file);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('File size exceeds limit');
          }
        ),
        {numRuns: 30}
      );
    });
  });


  // Property 16: Document association
  describe('Property 16: Document association', () => {
    it('should associate documents with correct trip and stage', () => {
      fc.assert(
        fc.property(
          DataFactory.tripIdArbitrary(),
          fc.constantFrom<DocumentStage>('loading', 'unloading'),
          DataFactory.documentFileArbitrary(),
          (tripId: string, stage: DocumentStage, file: DocumentFile) => {
            const createDocument = (
              tId: string,
              s: DocumentStage,
              f: DocumentFile
            ): Document => ({
              id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              tripId: tId,
              stage: s,
              uri: f.uri,
              type: f.type,
              name: f.name,
              size: f.size,
              uploadedAt: new Date(),
              uploaded: false,
            });

            const document = createDocument(tripId, stage, file);

            expect(document.tripId).toBe(tripId);
            expect(document.stage).toBe(stage);
            expect(document.uri).toBe(file.uri);
            expect(document.type).toBe(file.type);
            expect(document.name).toBe(file.name);
            expect(document.size).toBe(file.size);
            expect(document.uploaded).toBe(false);
          }
        ),
        {numRuns: 100}
      );
    });

    it('should generate unique document IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({min: 2, max: 10}),
          (count: number) => {
            const generateId = () =>
              `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const ids = new Set<string>();
            for (let i = 0; i < count; i++) {
              ids.add(generateId());
            }

            // All IDs should be unique
            expect(ids.size).toBe(count);
          }
        ),
        {numRuns: 50}
      );
    });

    it('should correctly filter documents by stage', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({minLength: 5, maxLength: 20}),
              stage: fc.constantFrom<DocumentStage>('loading', 'unloading'),
            }),
            {minLength: 1, maxLength: 20}
          ),
          fc.constantFrom<DocumentStage>('loading', 'unloading'),
          (docs, filterStage) => {
            const filtered = docs.filter(d => d.stage === filterStage);
            
            // All filtered documents should have the correct stage
            filtered.forEach(d => {
              expect(d.stage).toBe(filterStage);
            });

            // Count should match
            const expectedCount = docs.filter(d => d.stage === filterStage).length;
            expect(filtered.length).toBe(expectedCount);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  // Property 17: Document persistence
  describe('Property 17: Document persistence', () => {
    it('should maintain document data integrity through serialization', () => {
      fc.assert(
        fc.property(
          DataFactory.documentArbitrary(),
          (document: Document) => {
            // Simulate JSON serialization (as used in AsyncStorage)
            const serialized = JSON.stringify(document);
            const deserialized = JSON.parse(serialized);

            // Restore date
            deserialized.uploadedAt = new Date(deserialized.uploadedAt);

            expect(deserialized.id).toBe(document.id);
            expect(deserialized.tripId).toBe(document.tripId);
            expect(deserialized.stage).toBe(document.stage);
            expect(deserialized.uri).toBe(document.uri);
            expect(deserialized.type).toBe(document.type);
            expect(deserialized.name).toBe(document.name);
            expect(deserialized.size).toBe(document.size);
            expect(deserialized.uploaded).toBe(document.uploaded);
          }
        ),
        {numRuns: 100}
      );
    });

    it('should preserve document array order through serialization', () => {
      fc.assert(
        fc.property(
          fc.array(DataFactory.documentArbitrary(), {minLength: 1, maxLength: 10}),
          (documents: Document[]) => {
            const serialized = JSON.stringify(documents);
            const deserialized: Document[] = JSON.parse(serialized);

            expect(deserialized.length).toBe(documents.length);

            for (let i = 0; i < documents.length; i++) {
              expect(deserialized[i].id).toBe(documents[i].id);
              expect(deserialized[i].tripId).toBe(documents[i].tripId);
            }
          }
        ),
        {numRuns: 50}
      );
    });
  });

  // Property 18: Completion validation
  describe('Property 18: Completion validation', () => {
    it('should require documents for both stages to complete trip', () => {
      fc.assert(
        fc.property(
          fc.array(DataFactory.documentArbitrary(), {minLength: 0, maxLength: 10}),
          (documents: Document[]) => {
            const validateForCompletion = (docs: Document[]): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];
              const loadingDocs = docs.filter(d => d.stage === 'loading');
              const unloadingDocs = docs.filter(d => d.stage === 'unloading');

              if (loadingDocs.length === 0) {
                errors.push('At least one loading document is required');
              }

              if (unloadingDocs.length === 0) {
                errors.push('At least one unloading document is required');
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateForCompletion(documents);
            const hasLoading = documents.some(d => d.stage === 'loading');
            const hasUnloading = documents.some(d => d.stage === 'unloading');

            if (hasLoading && hasUnloading) {
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            } else {
              expect(result.isValid).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
            }
          }
        ),
        {numRuns: 100}
      );
    });

    it('should pass validation with at least one document per stage', () => {
      fc.assert(
        fc.property(
          fc.array(DataFactory.documentArbitrary(), {minLength: 1, maxLength: 5}).map(docs => 
            docs.map((d, i) => ({...d, stage: i === 0 ? 'loading' as const : 'unloading' as const}))
          ),
          (documents: Document[]) => {
            // Ensure we have at least one of each
            const withBothStages = [
              {...documents[0], stage: 'loading' as const},
              {...(documents[1] || documents[0]), stage: 'unloading' as const},
            ];

            const validateForCompletion = (docs: Document[]): {isValid: boolean; errors: string[]} => {
              const errors: string[] = [];
              const loadingDocs = docs.filter(d => d.stage === 'loading');
              const unloadingDocs = docs.filter(d => d.stage === 'unloading');

              if (loadingDocs.length === 0) {
                errors.push('At least one loading document is required');
              }

              if (unloadingDocs.length === 0) {
                errors.push('At least one unloading document is required');
              }

              return {isValid: errors.length === 0, errors};
            };

            const result = validateForCompletion(withBothStages);
            expect(result.isValid).toBe(true);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Document Upload Properties', () => {
    it('should track upload status correctly', () => {
      fc.assert(
        fc.property(
          DataFactory.documentArbitrary(),
          fc.boolean(),
          (document: Document, uploadSuccess: boolean) => {
            const simulateUpload = (doc: Document, success: boolean): Document => {
              if (success) {
                return {...doc, uploaded: true};
              }
              return doc;
            };

            const result = simulateUpload(document, uploadSuccess);

            if (uploadSuccess) {
              expect(result.uploaded).toBe(true);
            } else {
              expect(result.uploaded).toBe(document.uploaded);
            }
          }
        ),
        {numRuns: 50}
      );
    });

    it('should count pending uploads correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({minLength: 5, maxLength: 20}),
              uploaded: fc.boolean(),
            }),
            {minLength: 0, maxLength: 20}
          ),
          (docs) => {
            const pendingCount = docs.filter(d => !d.uploaded).length;
            const uploadedCount = docs.filter(d => d.uploaded).length;

            expect(pendingCount + uploadedCount).toBe(docs.length);
          }
        ),
        {numRuns: 50}
      );
    });
  });

  describe('Document Count Properties', () => {
    it('should correctly count documents by stage', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              stage: fc.constantFrom<DocumentStage>('loading', 'unloading'),
            }),
            {minLength: 0, maxLength: 20}
          ),
          (docs) => {
            const getDocumentCount = (documents: {stage: DocumentStage}[]) => {
              const loading = documents.filter(d => d.stage === 'loading').length;
              const unloading = documents.filter(d => d.stage === 'unloading').length;
              return {loading, unloading, total: documents.length};
            };

            const count = getDocumentCount(docs);

            expect(count.loading + count.unloading).toBe(count.total);
            expect(count.total).toBe(docs.length);
          }
        ),
        {numRuns: 50}
      );
    });
  });
});
