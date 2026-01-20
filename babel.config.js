module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/services': './src/services',
          '@/types': './src/types',
          '@/store': './src/store',
          '@/utils': './src/utils',
          '@/navigation': './src/navigation',
        },
      },
    ],
  ],
};
