import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function Loader({ size = 'md', style }: LoaderProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 60;
      case 'lg':
        return 120;
      default:
        return 80;
    }
  };

  const animationSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('@/assets/animations/loading.json')}
        autoPlay
        loop
        style={{
          width: animationSize,
          height: animationSize,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});