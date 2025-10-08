import { Colors, Typography } from '@/constants';
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface TitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  color?: keyof typeof Colors.text;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export const Title: React.FC<TitleProps> = ({
  children,
  level = 1,
  color = 'primary',
  align = 'left',
  style,
  numberOfLines,
}) => {
  const getTypographyStyle = () => {
    switch (level) {
      case 1:
        return Typography.styles.h1;
      case 2:
        return Typography.styles.h2;
      case 3:
        return Typography.styles.h3;
      case 4:
        return Typography.styles.h4;
      case 5:
        return Typography.styles.h5;
      case 6:
        return Typography.styles.h6;
      case 7:
        return Typography.styles.h7;
      case 8:
        return Typography.styles.h8;
      case 9:
        return Typography.styles.h9;
      default:
        return Typography.styles.h1;
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

  return (
    <Text
      style={[
        getTypographyStyle(),
        {
          color: getTextColor(),
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  // Si besoin de styles additionnels
});

export default Title;