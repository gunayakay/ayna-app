import Skeleton from 'react-native-reanimated-skeleton';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface HeaderSkeletonLoadingProps {
  isLoading: boolean;
}

export default function HeaderSkeletonLoading({ isLoading }: HeaderSkeletonLoadingProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <Skeleton
      containerStyle={styles.skeletonContainer}
      isLoading={isLoading}
      animationDirection="horizontalRight"
      layout={[
        { key: 'profilePhoto', ...styles.profilePhoto },
        {
          key: 'welcomeWrapper',
          ...styles.welcomeWrapper,
          children: [
            { key: 'welcomeText', ...styles.welcomeText },
            { key: 'welcomeSubtext', ...styles.welcomeSubtext },
          ],
        },
      ]}
    />
  );
}

const stylesheet = createStyleSheet(theme => ({
  skeletonContainer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[2],
  },
  profilePhoto: {
    width: theme.spacing[12],
    aspectRatio: 1,
    borderRadius: theme.borderRadius.full,
  },
  welcomeWrapper: {
    width: 120,
    gap: theme.spacing[1],
    justifyContent: 'center',
  },
  welcomeText: {
    width: '100%',
    height: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
  },
  welcomeSubtext: {
    width: '50%',
    height: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
  },
}));
