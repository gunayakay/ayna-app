module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
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
          '#lang': './src/lang',
        },
      },
    ],

    'react-native-reanimated/plugin',
  ],
};
