import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function PrimaryButton({ title, onPress, variant = 'primary' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, variant === 'secondary' ? styles.secondary : styles.primary]}
      activeOpacity={0.9}
    >
      <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primary: {
    backgroundColor: colors.glass,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  secondary: {
    backgroundColor: colors.white,
  },
  text: { color: colors.white, fontSize: 16, fontWeight: '700' },
  textSecondary: { color: colors.primary },
});
