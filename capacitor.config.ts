import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thethreethings.app',
  appName: 'The Three Things',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
