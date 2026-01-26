// import React from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import {Typography} from '@/components';
// import {colors, spacing, borderRadius, shadows, typography} from '@/theme/colors';

// interface ProofDocumentUploadProps {
//   documents: string[];
//   onTakePhoto: () => void;
//   onPickImage: () => void;
//   onRemoveDocument: (index: number) => void;
//   title?: string;
//   subtitle?: string;
// }

// export const ProofDocumentUpload: React.FC<ProofDocumentUploadProps> = ({
//   documents,
//   onTakePhoto,
//   onPickImage,
//   onRemoveDocument,
//   title = 'Upload Documents',
//   subtitle = 'Capture or select photos',
// }) => {
//   return (
//     <View style={styles.container}>
//       <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.title}>
//         {title}
//       </Typography>
//       <Typography variant="body" color="textSecondary" style={styles.subtitle}>
//         {subtitle}
//       </Typography>

//       {documents.length > 0 ? (
//         <View style={styles.documentsContainerInline}>
//           {/* Documents Count Header */}
//           <View style={styles.documentsHeaderInline}>
//             <Typography
//               variant="smallMedium"
//               color="textSecondary"
//               weight="600"
//               style={styles.documentsCountInline}>
//               {documents.length} Document(s) Added
//             </Typography>
//           </View>

//           {/* Documents Grid */}
//           <View style={styles.documentsGridInline}>
//             {documents.map((uri, index) => (
              
//               <View key={index} style={styles.documentItemInline}> 
//               <>
//               {
//                 console.log(uri)
//               }
//               </>
//                 <Image source={{uri:uri?.path || uri?.uri}} style={styles.documentItemImageInline} />
//                 <TouchableOpacity
//                   style={styles.removeDocumentButtonInline}
//                   onPress={() => onRemoveDocument(index)}
//                   activeOpacity={0.7}>
//                   <Typography
//                     variant="h4"
//                     color="error"
//                     weight="700"
//                     style={styles.removeDocumentTextInline}>
//                     ✕
//                   </Typography>
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.documentActionButtonsInline}>
//             <TouchableOpacity
//               style={styles.addDocumentButtonInline}
//               onPress={onTakePhoto}
//               activeOpacity={0.7}>
//               <Image
//                 source={require('@/assets/images/camera.png')}
//                 style={[styles.uploadOptionIconImage, {tintColor: 'black'}]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.addDocumentButtonInline}
//               onPress={onPickImage}
//               activeOpacity={0.7}>
//               <Image
//                 source={require('@/assets/images/gallery.png')}
//                 style={[
//                   styles.uploadOptionIconImage,
//                   styles.uploadOptionIconImageGallery,
//                   {tintColor: 'black'},
//                 ]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <View style={styles.uploadOptionsContainerInline}>
//           <TouchableOpacity
//             style={styles.uploadOptionInline}
//             onPress={onTakePhoto}
//             activeOpacity={0.7}>
//             <View style={styles.uploadOptionIconInline}>
//               <Image
//                 source={require('@/assets/images/camera.png')}
//                 style={styles.uploadOptionIconImage}
//                 resizeMode="contain"
//               />
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.uploadOptionInline}
//             onPress={onPickImage}
//             activeOpacity={0.7}>
//             <View style={[styles.uploadOptionIconInline, styles.uploadOptionIconGalleryInline]}>
//               <Image
//                 source={require('@/assets/images/gallery.png')}
//                 style={[styles.uploadOptionIconImage, styles.uploadOptionIconImageGallery]}
//                 resizeMode="contain"
//               />
//             </View>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginTop: spacing.sm,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: 5,
//   },
//   title: {
//     ...typography.h3,
//     color: colors.textPrimary,
//     fontWeight: '700',
//     marginBottom: spacing.sm,
//     fontSize: 18,
//   },
//   subtitle: {
//     ...typography.bodyMedium,
//     color: colors.textSecondary,
//     marginBottom: spacing.lg,
//     fontSize: 14,
//   },
//   documentsContainerInline: {
//     marginTop: spacing.sm,
//   },
//   documentsHeaderInline: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//   },
//   documentsCountInline: {
//     ...typography.bodyMedium,
//     color: colors.textPrimary,
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   documentsGridInline: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: spacing.md,
//     marginBottom: spacing.md,
//   },
//   documentItemInline: {
//     width: '30%',
//     aspectRatio: 1,
//     borderRadius: borderRadius.md,
//     overflow: 'hidden',
//     position: 'relative',
//     ...shadows.sm,
//   },
//   documentItemImageInline: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   removeDocumentButtonInline: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: colors.error,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   removeDocumentTextInline: {
//     color: colors.white,
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   documentActionButtonsInline: {
//     flexDirection: 'row',
//     gap: spacing.md,
//     marginTop: spacing.md,
//     justifyContent: 'center',
//   },
//   addDocumentButtonInline: {
//     flex: 1,
//     padding: spacing.md,
//     backgroundColor: colors.background,
//     borderRadius: borderRadius.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//     alignItems: 'center',
//   },
//   uploadOptionsContainerInline: {
//     flexDirection: 'row',
//     gap: spacing.md,
//     marginTop: spacing.sm,
//   },
//   uploadOptionInline: {
//     flex: 1,
//     borderWidth: 2,
//     borderColor: colors.primary,
//     borderStyle: 'dashed',
//     borderRadius: borderRadius.lg,
//     padding: spacing.lg,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.primarySoft,
//     minHeight: 100,
//   },
//   uploadOptionIconInline: {
//     width: 50,
//     height: 50,
//     borderRadius: 12,
//     backgroundColor: colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     ...shadows.sm,
//   },
//   uploadOptionIconGalleryInline: {
//     backgroundColor: colors.success,
//   },
//   uploadOptionIconImage: {
//     width: 28,
//     height: 28,
//     tintColor: colors.white,
//   },
//   uploadOptionIconImageGallery: {
//     tintColor: colors.white,
//   },
// });


import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Typography} from '@/components';
import {colors, spacing, borderRadius, shadows, typography} from '@/theme/colors';

interface ProofDocumentUploadProps {
  documents: string[];
  onTakePhoto: () => void;
  onPickImage: () => void;
  onRemoveDocument: (index: number) => void;
  title?: string;
  subtitle?: string;
}

export const ProofDocumentUpload: React.FC<ProofDocumentUploadProps> = ({
  documents,
  onTakePhoto,
  onPickImage,
  onRemoveDocument,
  title = 'Upload Documents',
  subtitle = 'Capture or select photos',
}) => {
  return (
    <View style={styles.container}>
      <Typography variant="bodyMedium" color="textPrimary" weight="600" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" color="textSecondary" style={styles.subtitle}>
        {subtitle}
      </Typography>

      {documents.length > 0 ? (
        <View style={styles.documentsContainerInline}>
          {/* Documents Count Header */}
          <View style={styles.documentsHeaderInline}>
            <Typography
              variant="smallMedium"
              color="textSecondary"
              weight="600"
              style={styles.documentsCountInline}>
              {documents.length} Document(s) Added
            </Typography>
          </View>

          {/* Documents Grid */}
          <View style={styles.documentsGridInline}>
            {documents.map((uri, index) => (
              
              <View key={index} style={styles.documentItemInline}> 
              <>
              {
                console.log(uri)
              }
              </>
                <Image source={{uri:uri?.path || uri?.uri}} style={styles.documentItemImageInline} />
                <TouchableOpacity
                  style={styles.removeDocumentButtonInline}
                  onPress={() => onRemoveDocument(index)}
                  activeOpacity={0.7}>
                  <Typography
                    variant="h4"
                    color="error"
                    weight="700"
                    style={styles.removeDocumentTextInline}>
                    ✕
                  </Typography>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.documentActionButtonsInline}>
            <TouchableOpacity
              style={styles.addDocumentButtonInline}
              onPress={onTakePhoto}
              activeOpacity={0.7}>
              <Image
                source={require('@/assets/images/camera.png')}
                style={[styles.uploadOptionIconImage, {tintColor: 'black'}]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addDocumentButtonInline}
              onPress={onPickImage}
              activeOpacity={0.7}>
              <Image
                source={require('@/assets/images/gallery.png')}
                style={[
                  styles.uploadOptionIconImage,
                  styles.uploadOptionIconImageGallery,
                  {tintColor: 'black'},
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.uploadOptionsContainerInline}>
          <TouchableOpacity
            style={styles.uploadOptionInline}
            onPress={onTakePhoto}
            activeOpacity={0.7}>
            <View style={styles.uploadOptionIconInline}>
              <Image
                source={require('@/assets/images/camera.png')}
                style={styles.uploadOptionIconImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadOptionInline}
            onPress={onPickImage}
            activeOpacity={0.7}>
            <View style={[styles.uploadOptionIconInline, styles.uploadOptionIconGalleryInline]}>
              <Image
                source={require('@/assets/images/gallery.png')}
                style={[styles.uploadOptionIconImage, styles.uploadOptionIconImageGallery]}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 5,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    fontSize: 18,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 14,
  },
  documentsContainerInline: {
    marginTop: spacing.sm,
  },
  documentsHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  documentsCountInline: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  documentsGridInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  documentItemInline: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  documentItemImageInline: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeDocumentButtonInline: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeDocumentTextInline: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  documentActionButtonsInline: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  addDocumentButtonInline: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  uploadOptionsContainerInline: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  uploadOptionInline: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    minHeight: 100,
  },
  uploadOptionIconInline: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  uploadOptionIconGalleryInline: {
    backgroundColor: colors.success,
  },
  uploadOptionIconImage: {
    width: 28,
    height: 28,
    tintColor: colors.white,
  },
  uploadOptionIconImageGallery: {
    tintColor: colors.white,
  },
});