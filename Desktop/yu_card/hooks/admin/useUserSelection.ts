import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export const useUserSelection = () => {
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const loadAvailableUsers = useCallback(async () => {
    try {
      const { adminUsersService } = await import('@/services/adminUsersService');
      const response = await adminUsersService.getAllUsers({ limit: 100 });
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs');
    }
  }, []);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUserIds([]);
  }, []);

  const filteredUsers = useMemo(() => {
    return availableUsers.filter(user => {
      if (!userSearchQuery.trim()) return true;
      const query = userSearchQuery.toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    });
  }, [availableUsers, userSearchQuery]);

  return {
    availableUsers: filteredUsers,
    selectedUserIds,
    userSearchQuery,
    setUserSearchQuery,
    loadAvailableUsers,
    toggleUserSelection,
    clearSelection,
    setSelectedUserIds,
  };
};
