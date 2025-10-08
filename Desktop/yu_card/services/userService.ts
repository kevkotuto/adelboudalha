import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  User,
  UserAddress,
  UserPreference,
  UserStatsResponse,
  UpdateProfileRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  UpdatePreferencesRequest,
  FileUpload,
  UploadProgressCallback,
} from '@/types';

// ==================================
// USER MANAGEMENT SERVICE
// ==================================

export class UserService {
  // ==================================
  // PROFILE MANAGEMENT
  // ==================================

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return await apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    return await apiClient.put<User>(API_ENDPOINTS.USERS.PROFILE, profileData);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    file: FileUpload,
    onProgress?: UploadProgressCallback
  ): Promise<{ avatarUrl: string }> {
    return await apiClient.upload<{ avatarUrl: string }>(
      API_ENDPOINTS.USERS.AVATAR,
      file,
      undefined,
      onProgress
    );
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.USERS.DELETE_ACCOUNT
    );
  }

  // ==================================
  // ADDRESS MANAGEMENT
  // ==================================

  /**
   * Get user addresses
   */
  async getAddresses(): Promise<UserAddress[]> {
    const response = await apiClient.get<{ addresses: UserAddress[] }>(API_ENDPOINTS.USERS.ADDRESSES);
    return response.addresses || [];
  }

  /**
   * Create new address
   */
  async createAddress(addressData: CreateAddressRequest): Promise<UserAddress> {
    return await apiClient.post<UserAddress>(
      API_ENDPOINTS.USERS.ADDRESSES,
      addressData
    );
  }

  /**
   * Update address by ID
   */
  async updateAddress(
    addressId: string,
    addressData: UpdateAddressRequest
  ): Promise<UserAddress> {
    return await apiClient.put<UserAddress>(
      API_ENDPOINTS.USERS.ADDRESS_BY_ID(addressId),
      addressData
    );
  }

  /**
   * Delete address by ID
   */
  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.USERS.ADDRESS_BY_ID(addressId)
    );
  }

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string): Promise<UserAddress> {
    return await apiClient.put<UserAddress>(
      API_ENDPOINTS.USERS.ADDRESS_BY_ID(addressId),
      { isDefault: true }
    );
  }

  // ==================================
  // PREFERENCES MANAGEMENT
  // ==================================

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreference> {
    const response = await apiClient.get<{ preferences: UserPreference }>(API_ENDPOINTS.USERS.PREFERENCES);
    return response.preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferencesData: UpdatePreferencesRequest
  ): Promise<UserPreference> {
    return await apiClient.put<UserPreference>(
      API_ENDPOINTS.USERS.PREFERENCES,
      preferencesData
    );
  }

  // ==================================
  // USER STATISTICS
  // ==================================

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStatsResponse> {
    const response = await apiClient.get<{ stats: UserStatsResponse }>(API_ENDPOINTS.USERS.STATS);
    return response.stats;
  }

  /**
   * Get user statistics by ID (Admin only)
   */
  async getUserStatsById(userId: string): Promise<UserStatsResponse> {
    return await apiClient.get<UserStatsResponse>(
      API_ENDPOINTS.USERS.STATS_BY_ID(userId)
    );
  }

  // ==================================
  // PUSH NOTIFICATIONS
  // ==================================

  /**
   * Update user's push notification token
   */
  async updatePushToken(expoPushToken: string): Promise<{ expoPushToken: string }> {
    return await apiClient.patch<{ expoPushToken: string }>(
      API_ENDPOINTS.USERS.PUSH_TOKEN,
      { expoPushToken }
    );
  }
}

// ==================================
// USER HELPER FUNCTIONS
// ==================================

export const userHelpers = {
  /**
   * Format user display name
   */
  formatDisplayName(user: User): string {
    return user.fullName || user.phone;
  },

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(user: User): string {
    const name = user.fullName;
    if (!name) {
      return user.phone.slice(-2).toUpperCase();
    }

    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  /**
   * Format phone number for display
   */
  formatPhoneForDisplay(phone: string): string {
    // Format +225 01 23 45 67 89 to +225 01 23 45 67 89
    if (phone.startsWith('+225')) {
      const cleanNumber = phone.replace(/\D/g, ''); // Remove non-digits
      if (cleanNumber.length === 13) { // 225 + 10 digits
        const countryCode = cleanNumber.slice(0, 3);
        const rest = cleanNumber.slice(3);
        return `+${countryCode} ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)} ${rest.slice(8)}`;
      }
    }
    return phone;
  },

  /**
   * Check if user has completed profile
   */
  hasCompleteProfile(user: User): boolean {
    return !!(
      user.fullName &&
      user.phoneVerified &&
      user.email
    );
  },

  /**
   * Get default address from user addresses
   */
  getDefaultAddress(addresses: UserAddress[]): UserAddress | undefined {
    return addresses.find(addr => addr.isDefault);
  },

  /**
   * Get shipping addresses
   */
  getShippingAddresses(addresses: UserAddress[]): UserAddress[] {
    return addresses.filter(
      addr => addr.type === 'SHIPPING' || addr.type === 'BOTH'
    );
  },

  /**
   * Get billing addresses
   */
  getBillingAddresses(addresses: UserAddress[]): UserAddress[] {
    return addresses.filter(
      addr => addr.type === 'BILLING' || addr.type === 'BOTH'
    );
  },

  /**
   * Format address for display
   */
  formatAddressForDisplay(address: UserAddress): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.stateProvince,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(', ');
  },

  /**
   * Validate address completeness
   */
  validateAddress(address: Partial<CreateAddressRequest>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Nom complet
    if (!address.fullName?.trim()) {
      errors.push('Le nom complet est requis');
    } else if (address.fullName.trim().length < 2) {
      errors.push('Le nom complet doit contenir au moins 2 caractères');
    }

    // Téléphone
    if (!address.phone?.trim()) {
      errors.push('Le numéro de téléphone est requis');
    } else if (address.phone.trim().length < 8) {
      errors.push('Le numéro de téléphone est invalide');
    }

    // Adresse ligne 1
    if (!address.addressLine1?.trim()) {
      errors.push('L\'adresse est requise');
    } else if (address.addressLine1.trim().length < 5) {
      errors.push('L\'adresse doit contenir au moins 5 caractères');
    }

    // Ville
    if (!address.city?.trim()) {
      errors.push('La ville est requise');
    } else if (address.city.trim().length < 2) {
      errors.push('Le nom de la ville doit contenir au moins 2 caractères');
    }

    // Pays
    if (!address.country?.trim()) {
      errors.push('Le pays est requis');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get user role display name
   */
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'CLIENT':
        return 'Client';
      default:
        return role;
    }
  },

  /**
   * Get user status display name
   */
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'SUSPENDED':
        return 'Suspendu';
      case 'DELETED':
        return 'Supprimé';
      default:
        return status;
    }
  },

  /**
   * Check if user can perform admin actions
   */
  canPerformAdminActions(user: User): boolean {
    return user.role === 'ADMIN' && user.status === 'ACTIVE';
  },

  /**
   * Get notification preference summary
   */
  getNotificationSummary(preferences: UserPreference): {
    enabled: number;
    total: number;
  } {
    const notifications = [
      preferences.notificationsEnabled,
      preferences.smsNotifications,
      preferences.emailNotifications,
      preferences.pushNotifications,
    ];

    const enabled = notifications.filter(Boolean).length;

    return { enabled, total: notifications.length };
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const userService = new UserService();
export default userService;