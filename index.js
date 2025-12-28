import './src/theme/unistyles';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import 'expo-router/entry';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
