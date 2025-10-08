import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

interface UserSelectorModalProps {
  visible: boolean;
  availableUsers: any[];
  selectedUserIds: string[];
  userSearchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleUser: (userId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UserSelectorModal: React.FC<UserSelectorModalProps> = ({
  visible,
  availableUsers,
  selectedUserIds,
  userSearchQuery,
  onSearchChange,
  onToggleUser,
  onConfirm,
  onCancel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        edges={['top']}
      >
        <View style={styles.inner}>
          <View style={[styles.header, { borderBottomColor: theme.border.primary }]}>
            <Title level={3} style={{ color: theme.text.primary }}>
              Sélectionner les utilisateurs
            </Title>
            <Pressable onPress={onCancel}>
              <Ionicons name="close" size={24} color={theme.text.primary} />
            </Pressable>
          </View>

          <View style={{ paddingVertical: Spacing.md }}>
            <SearchInput
              placeholder="Rechercher un utilisateur..."
              value={userSearchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {availableUsers.map(user => (
              <Pressable
                key={user.id}
                style={[
                  styles.userItem,
                  { backgroundColor: theme.background.card, borderColor: theme.border.primary },
                  selectedUserIds.includes(user.id) && {
                    borderColor: Colors.primary,
                    backgroundColor: Colors.primary + '10',
                  },
                ]}
                onPress={() => onToggleUser(user.id)}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color={Colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Paragraph weight="medium" style={{ color: theme.text.primary }}>
                      {user.fullName}
                    </Paragraph>
                    <Caption color="secondary">{user.phone}</Caption>
                    {user.email && (
                      <Caption color="secondary" style={{ fontSize: 10 }}>
                        {user.email}
                      </Caption>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: theme.border.primary },
                    selectedUserIds.includes(user.id) && styles.checkboxActive,
                  ]}
                >
                  {selectedUserIds.includes(user.id) && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: theme.border.primary }]}>
            <Button
              variant="outline"
              onPress={onCancel}
              style={[styles.button, { borderColor: theme.border.primary }]}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: Colors.primary }]}
            >
              Confirmer ({selectedUserIds.length})
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Spacing.lg,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
