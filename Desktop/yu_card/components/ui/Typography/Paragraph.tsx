import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors, Typography } from '@/constants';

interface ParagraphProps {
  children: React.ReactNode;
  size?: 'small' | 'base' | 'large';
  color?: keyof typeof Colors.text;
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  numberOfLines?: number;
  weight?: 'regular' | 'medium';
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  size = 'base',
  color = 'primary',
  align = 'left',
  style,
  numberOfLines,
  weight = 'regular',
}) => {
  const getTypographyStyle = () => {
    switch (size) {
      case 'small':
        return Typography.styles.bodySmall;
      case 'base':
        return Typography.styles.body;
      case 'large':
        return Typography.styles.bodyLarge;
      default:
        return Typography.styles.body;
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
        return Colors.text.primary;
    }
  };

  const getFontFamily = () => {
    return weight === 'medium'
      ? Typography.fonts.ubuntu.medium
      : Typography.fonts.ubuntu.regular;
  };

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
      {children}
    </Text>
  );
};

export default Paragraph;