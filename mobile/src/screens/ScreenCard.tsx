import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ScreenCardProps = {
  title: string;
  subtitle: string;
};

function ScreenCard({ title, subtitle }: ScreenCardProps) {
  return (
    <View style={styles.contentCard}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: '#4a4a4a',
  },
});

export default ScreenCard;
