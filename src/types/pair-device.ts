export enum OperatingSystem {
  ANDROID,
  IOS,
}

export interface PairDeviceRequest {
  deviceName: string;
  fcmToken: string;
  operatingSystem: OperatingSystem;
  hasUserEnabledNotifications: boolean;
}
