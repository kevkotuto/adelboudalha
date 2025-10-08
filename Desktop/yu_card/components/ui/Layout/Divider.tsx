import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants';
import { Paragraph } from '../Typography';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
  margin?: 'none' | 'sm' | 'md' | 'lg';
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  color = Colors.border.primary,
  style,
  margin = 'md',
  label,
  labelPosition = 'center',
}) => {
  const getMarginStyles = () => {
    const marginValue = {
      none: 0,
      sm: Spacing.sm,
      md: Spacing.md,
      lg: Spacing.lg,
    }[margin];

    if (orientation === 'horizontal') {
      return {
        marginVertical: marginValue,
      };
    } else {
      return {
        marginHorizontal: marginValue,
      };
    }
  };

  const getBorderStyle = () => {
    const borderStyle = variant === 'dashed' ? 'dashed' : variant === 'dotted' ? 'dotted' : 'solid';

    if (orientation === 'horizontal') {
      return {
        borderBottomWidth: thickness,
        borderBottomColor: color,
        borderBottomStyle: borderStyle,
      };
    } else {
      return {
        borderRightWidth: thickness,
        borderRightColor: color,
        borderRightStyle: borderStyle,
        height: '100%',
      };
    }
  };

  if (label && orientation === 'horizontal') {
    return (
      <View style={[styles.labelContainer, getMarginStyles(), style]}>
        {labelPosition !== 'left' && (
          <View style={[styles.line, getBorderStyle(), styles.flexLine]} />
        )}

        <View style={styles.labelWrapper}>
          <Paragraph size="small" color="secondary" style={styles.label}>
            {label}
          </Paragraph>
        </View>

        {labelPosition !== 'right' && (
          <View style={[styles.line, getBorderStyle(), styles.flexLine]} />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.divider,
        getBorderStyle(),
        getMarginStyles(),
        orientation === 'vertical' && styles.vertical,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    // Base divider styles
  },

  vertical: {
    width: 1,
    alignSelf: 'stretch',
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  line: {
    height: 1,
  },

  flexLine: {
    flex: 1,
  },

  labelWrapper: {
    paddingHorizontal: Spacing.md,
  },

  label: {
    // Label styling handled by Typography component
  },
});

export default Divider;