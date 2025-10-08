import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

interface NotificationModeButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}

export const NotificationModeButton: React.FC<NotificationModeButtonProps> = ({
  icon,
  label,
  active,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: theme.background.card, borderColor: theme.border.primary },
        active && { backgroundColor: Colors.primary, borderColor: Colors.primary },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={active ? Colors.white : theme.text.primary} />
      <Caption style={[styles.text, active && { color: Colors.white }]}>{label}</Caption>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  text: {
    marginTop: Spacing.xs,
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 12,
  },
});
