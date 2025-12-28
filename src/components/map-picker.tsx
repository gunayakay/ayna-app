import { forwardRef, useCallback } from 'react';
import { View } from 'react-native';

import MapView, { Region } from 'react-native-maps';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { LocationPin } from '#assets/svg';
import { Loading } from '#components';
import { useGetCurrentLocation } from '#hooks';

import { Svg } from './atoms';

export interface MapPickerProps {
  onLocationSelected: (location: { latitude: number; longitude: number }) => void;
  onMapReady: (location: { latitude: number; longitude: number }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const MapPicker = forwardRef<MapView, MapPickerProps>(
  ({ onLocationSelected, initialLocation, onMapReady }, ref) => {
    const { styles, theme } = useStyles(stylesheet);
    const { useGetLatLongQuery } = useGetCurrentLocation();
    const { data: latLong, isFetching } = useGetLatLongQuery();

    const handleOnRegionChangeComplete = useCallback((region: Region) => {
      onLocationSelected({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    }, []);

    const handleOnMapReady = useCallback(() => {
      onMapReady({
        latitude: latLong?.latitude ?? 0,
        longitude: latLong?.longitude ?? 0,
      });
    }, [latLong]);

    return (
      <View style={styles.container}>
        {isFetching && !initialLocation ? (
          <Loading />
        ) : (
          <>
            <View style={styles.marker}>
              <Svg
                Icon={LocationPin}
                width={theme.spacing[10]}
                height={theme.spacing[10]}
                fill={theme.colors.primary}
                strokeWidth={1.5}
                stroke={'transparent'}
              />
            </View>
            <MapView
              ref={ref}
              style={styles.map}
              showsUserLocation
              onRegionChangeComplete={handleOnRegionChangeComplete}
              onMapReady={handleOnMapReady}
              region={{
                latitude: initialLocation?.latitude ?? latLong?.latitude ?? 0,
                longitude: initialLocation?.longitude ?? latLong?.longitude ?? 0,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
            />
          </>
        )}
      </View>
    );
  }
);

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    width: '100%',
    aspectRatio: 1.7,
    borderRadius: theme.borderRadius['2xl'],
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -theme.spacing[10] / 2 }, { translateY: -theme.spacing[10] / 2 }],
    zIndex: 1000,
    width: theme.spacing[10],
    height: theme.spacing[10],
  },
  map: {
    flex: 1,
    borderRadius: theme.borderRadius['2xl'],
  },
}));

export default MapPicker;
