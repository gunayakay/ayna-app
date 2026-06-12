module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Unistyles 3 plugin — module-resolver'dan ÖNCE çalışmalı ki orijinal
    // '#theme/unistyles' import yolunu görebilsin (autoProcessImports).
    [
      'react-native-unistyles/plugin',
      {
        root: 'src',
        autoProcessImports: ['#theme/unistyles'],
      },
    ],
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./'],
        alias: {
          '#': './src',
          '#components': './src/components',
          '#constants': './src/constants',
          '#theme': './src/theme',
          '#assets': './src/assets',
          '#utils': './src/utils',
          '#types': './src/types',
          '#lang': './src/lang',
        },
      },
    ],

    // Reanimated 4 → babel plugin artık react-native-worklets/plugin (EN SONDA).
    'react-native-worklets/plugin',
  ],
};
