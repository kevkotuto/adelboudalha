import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Caption, Paragraph, Title } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface AmountSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  step?: number;
}

export const AmountSlider: React.FC<AmountSliderProps> = ({
  min,
  max,
  value,
  onChange,
  currency = 'FCFA',
  step = 1000,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Current Value Display */}
      <View style={styles.valueContainer}>
        <Title level={4} style={styles.valueText}>
          {formatPrice(value)} {currency}
        </Title>
        <Caption color="secondary">Montant sélectionné</Caption>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={onChange}
          step={step}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.gray[200]}
          thumbTintColor={Colors.primary}
        />
      </View>

      {/* Min/Max Labels */}
      <View style={styles.labelsContainer}>
        <View style={styles.labelItem}>
          <Caption color="secondary" style={styles.labelText}>
            Min
          </Caption>
          <Paragraph style={styles.labelValue}>
            {formatPrice(min)}
          </Paragraph>
        </View>

        <View style={styles.labelSeparator}>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.labelItem}>
          <Caption color="secondary" style={styles.labelText}>
            Max
          </Caption>
          <Paragraph style={styles.labelValue}>
            {formatPrice(max)}
          </Paragraph>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  valueContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
  },

  valueText: {
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  sliderContainer: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },

  slider: {
    width: '100%',
    height: 40,
  },

  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },

  labelItem: {
    flex: 1,
    alignItems: 'center',
  },

  labelSeparator: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  separatorLine: {
    width: 20,
    height: 1,
    backgroundColor: Colors.border.primary,
  },

  labelText: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  labelValue: {
    fontWeight: '600',
    fontSize: 14,
  },
});
