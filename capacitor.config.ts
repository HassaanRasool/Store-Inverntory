import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.antigravity.storeapp',
  appName: 'Store Inventory',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      androidIsEncryption: false
    }
  }
};

export default config;
