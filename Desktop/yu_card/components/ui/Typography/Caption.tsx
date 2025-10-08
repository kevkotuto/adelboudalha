import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors, Typography } from '@/constants';

interface CaptionProps {
  children: React.ReactNode;
  variant?: 'caption' | 'overline' | 'label';
  color?: keyof typeof Colors.text;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
  uppercase?: boolean;
  weight?: 'regular' | 'medium' | 'bold';
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  variant = 'caption',
  color = 'secondary',
  align = 'left',
  style,
  numberOfLines,
  uppercase = false,
  weight = 'regular',
}) => {
  const getTypographyStyle = () => {
    switch (variant) {
      case 'caption':
        return Typography.styles.caption;
      case 'overline':
        return Typography.styles.overline;
      case 'label':
        return Typography.styles.label;
      default:
        return Typography.styles.caption;
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return Colors.text.primary;
      case 'secondary':
        return Colors.text.secondary;
      case 'tertiary':
        return Colors.text.tertiary;
      case 'inverse':
        return Colors.text.inverse;
      case 'accent':
        return Colors.text.accent;
      default:
        return Colors.text.secondary;
    }
  };

  const getFontFamily = () => {
    switch (weight) {
      case 'bold':
        return Typography.fonts.ubuntu.bold;
      case 'medium':
        return Typography.fonts.ubuntu.medium;
      case 'regular':
      default:
        return Typography.fonts.ubuntu.regular;
    }
  };

  const transformedChildren = uppercase && variant !== 'overline'
    ? String(children).toUpperCase()
    : children;

  return (
    <Text
      style={[
        getTypographyStyle(),
        {
          color: getTextColor(),
          textAlign: align,
          fontFamily: getFontFamily(),
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {transformedChildren}
    </Text>
  );
};

export default Caption;