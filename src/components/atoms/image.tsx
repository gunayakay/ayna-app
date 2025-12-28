import React, { useMemo } from 'react';
import { Image as RNImage } from 'react-native';

import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageSource } from 'expo-image';

interface CustomImageProps extends Omit<ExpoImageProps, 'source'> {
  source: ImageSource;
  calculateAspectRatio?: boolean;
}

const BLURHASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

/**
 * A wrapper to use the Expo Image component and calculate aspect ratio if needed
 * @param calculateAspectRatio - If true, the aspect ratio of the image will be calculated
 * @param style - The style of the image
 * @param placeholder - The placeholder of the image
 * @param source - The source of the image
 * @returns
 */
export default function Image({
  calculateAspectRatio = false,
  style,
  placeholder,
  source,
  ...props
}: CustomImageProps) {
  const aspectRatioStyle = useMemo(() => {
    if (calculateAspectRatio && source) {
      const { width, height } = RNImage.resolveAssetSource(source);
      return { aspectRatio: width / height };
    }
    return {};
  }, [calculateAspectRatio]);

  if (source && source.uri) {
    ExpoImage.prefetch(source.uri, {
      cachePolicy: 'memory',
    });
  }

  return (
    <ExpoImage
      {...props}
      placeholder={placeholder ?? BLURHASH}
      style={[style, aspectRatioStyle]}
      source={source}
    />
  );
}
