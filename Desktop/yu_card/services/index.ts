// ==================================
// SERVICE EXPORTS
// ==================================

// Core services
export { apiClient } from './apiClient';
export { authService, authHelpers } from './authService';
export { userService, userHelpers } from './userService';
export { productService, productHelpers } from './productService';
export { cartService, cartHelpers } from './cartService';
export { orderService, orderHelpers } from './orderService';
export { deliveryService } from './deliveryService';
export { notificationService } from './notificationService';
export { userNotificationsService } from './userNotificationsService';
export { waveService, waveHelpers } from './waveService';
export { searchService, searchHelpers } from './searchService';
export { uploadService, uploadHelpers } from './uploadService';
export { adminNotificationsService, notificationHelpers } from './adminNotificationsService';

// Configuration
export { config, API_ENDPOINTS } from './config';

// ==================================
// SERVICE INITIALIZATION
// ==================================

export const initializeServices = async (): Promise<void> => {
  try {
    // Initialize API client tokens from storage
    // This happens automatically in the ApiClient constructor

    console.log('Yu Card services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Yu Card services:', error);
  }
};

// ==================================
// HEALTH CHECK
// ==================================

export const checkServicesHealth = async (): Promise<{
  api: boolean;
  search: boolean;
  upload: boolean;
  wave: boolean;
}> => {
  const health = {
    api: false,
    search: false,
    upload: false,
    wave: false,
  };

  try {
    // Check API health
    const { apiClient } = await import('./apiClient');
    await apiClient.healthCheck();
    health.api = true;
  } catch (error) {
    console.warn('API health check failed:', error);
  }

  try {
    // Check search service health
    const { searchService } = await import('./searchService');
    await searchService.checkHealth();
    health.search = true;
  } catch (error) {
    console.warn('Search service health check failed:', error);
  }

  try {
    // Check upload service health
    const { uploadService } = await import('./uploadService');
    await uploadService.checkHealth();
    health.upload = true;
  } catch (error) {
    console.warn('Upload service health check failed:', error);
  }

  try {
    // Check Wave payment service health
    const { waveService } = await import('./waveService');
    await waveService.testWaveRoutes();
    health.wave = true;
  } catch (error) {
    console.warn('Wave service health check failed:', error);
  }

  return health;
};