import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors, FontSize, Spacing } from '../src/constants/theme';
import { allModelsReady } from '../src/services/modelManager';

export default function Index() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    allModelsReady().then(setReady);
  }, []);

  if (ready === null) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>Weva</Text>
        <ActivityIndicator color={Colors.primary} size="large" style={styles.spinner} />
      </View>
    );
  }

  return <Redirect href={ready ? '/(tabs)' : '/setup'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  spinner: { marginTop: Spacing.md },
});
