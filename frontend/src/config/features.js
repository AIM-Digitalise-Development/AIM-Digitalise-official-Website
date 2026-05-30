export const features = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableChat: import.meta.env.VITE_ENABLE_CHAT === 'true',
  enableNotifications: true,
  enableDarkMode: true,
  enableTwoFactor: false,
}