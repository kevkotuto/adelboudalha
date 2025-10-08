import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Paragraph } from './Typography';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { BorderRadius } from '@/constants/BorderRadius';

interface InfoBoxProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  message: string;
  style?: ViewStyle;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  type = 'info',
  message,
  style
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'warning':
        return { icon: 'warning', color: '#F59E0B' };
      case 'error':
        return { icon: 'close-circle', color: '#EF4444' };
      case 'info':
      default:
        return { icon: 'information-circle', color: '#3B82F6' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <View style={[styles.container, { backgroundColor: `${color}15` }, style]}>
      <Ionicons name={icon as any} size={20} color={color} style={styles.icon} />
      <Paragraph style={{ ...styles.message, color }}>{message}</Paragraph>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
