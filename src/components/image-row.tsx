import React, { Image, TouchableOpacity, View } from 'react-native';

import Skeleton from 'react-native-reanimated-skeleton';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Dots, User } from '#assets/svg';

import { Svg, Text } from './atoms';
import Row from './row';
import ShadowWrapper from './shadow-wrapper';

export interface ImageRowProps {
  title: string;
  onPress: () => void;
  imageUri?: string;
  description?: string;
  descriptionLabel?: string;
}

interface ImageRowSkeletonProps {
  isLoading: boolean;
}

export function ImageRowSkeleton({ isLoading }: ImageRowSkeletonProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <Skeleton
      containerStyle={styles.skeletonContainer}
      isLoading={isLoading}
      animationDirection="horizontalRight"
      layout={[
        { key: 'box', ...styles.box },
        { key: 'box2', ...styles.box },
        { key: 'box3', ...styles.box },
        { key: 'box4', ...styles.box },
        { key: 'box5', ...styles.box },
        { key: 'box6', ...styles.box },
        { key: 'box7', ...styles.box },
        { key: 'box8', ...styles.box },
        { key: 'box9', ...styles.box },
      ]}
    />
  );
}

export default function ImageRow({
  title,
  imageUri,
  onPress,
  descriptionLabel,
  description,
}: ImageRowProps) {
  const { styles, theme } = useStyles(stylesheet);
  const profilePicture = imageUri ? `${process.env.EXPO_PUBLIC_IMAGE_URL}${imageUri}` : null;

  return (
    <TouchableOpacity onPress={onPress}>
      <ShadowWrapper style={styles.shadowWrapper}>
        <Row style={styles.content}>
          <Row style={styles.businessContainer} gap={theme.spacing[4]}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.logo} />
            ) : (
              <View style={styles.logo}>
                <Svg
                  Icon={User}
                  fill={theme.colors.typography.PRIMARY[700]}
                  width={theme.spacing[4]}
                  height={theme.spacing[4]}
                  stroke={theme.colors.typography.PRIMARY[700]}
                  strokeWidth={1.5}
                />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.businessName}>{title}</Text>
              {descriptionLabel && description && (
                <Row>
                  <Text style={styles.descriptionLabel}>{descriptionLabel}:</Text>
                  <Text style={styles.description}>{description}</Text>
                </Row>
              )}
            </View>
          </Row>
          <Svg
            Icon={Dots}
            fill={theme.colors.typography.PRIMARY[400]}
            style={styles.dots}
            width={theme.spacing[4]}
            height={theme.spacing[4]}
            stroke={theme.colors.typography.PRIMARY[400]}
          />
        </Row>
      </ShadowWrapper>
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  shadowWrapper: {
    flex: 1,
    marginTop: theme.spacing[4],
    marginHorizontal: theme.spacing[4],
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing[2],
    justifyContent: 'space-between',
  },
  businessContainer: {
    flex: 1,
    flexShrink: 1,
  },
  businessName: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY[700],
  },
  logo: {
    width: theme.spacing[10],
    height: theme.spacing[10],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.typography.PRIMARY[200],
  },
  defaultAvatar: {
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.typography.PRIMARY[700],
    padding: theme.spacing[2],
  },
  textContainer: {
    gap: theme.spacing[2],
    flex: 1,
  },
  descriptionLabel: {
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[600],
  },
  description: {
    color: theme.colors.typography.PRIMARY[400],
  },
  dots: {
    transform: [{ rotate: '90deg' }],
  },
  skeletonContainer: {
    marginHorizontal: theme.spacing[4],
    gap: theme.spacing[4],
  },
  box: {
    height: 80,
    width: '100%',
    borderRadius: theme.borderRadius['4xl'],
  },
}));
