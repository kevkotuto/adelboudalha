import React from 'react';
import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor = Colors.background.primary,
  style,
  edges = ['top', 'bottom'],
}) => {
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor,
        },
        style,
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;