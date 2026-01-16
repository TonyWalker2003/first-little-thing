import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.alignertracker.app',
    appName: '牙套日記',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
