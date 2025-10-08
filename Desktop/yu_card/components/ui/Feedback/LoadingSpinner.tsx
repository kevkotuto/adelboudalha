import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  style
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 120;
      default:
        return 80;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('@/assets/animations/loading.json')}
        autoPlay
        loop
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});