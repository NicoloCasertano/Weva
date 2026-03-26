import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import {
  allModelsReady,
  downloadAllModels,
  type DownloadStep,
} from '../src/services/modelManager';

const STEP_LABELS: Record<DownloadStep, string> = {
  checking: 'Controllo modelli...',
  whisper: 'Scaricamento Whisper (~150MB)...',
  llama: 'Scaricamento LLM Phi-3 (~2.3GB)...',
  done: 'Pronto!',
};

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<DownloadStep>('checking');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    allModelsReady().then((ready) => {
      if (ready) router.replace('/(tabs)');
    });
  }, [router]);

  const handleDownload = useCallback(async () => {
    try {
      setError(null);
      setIsDownloading(true);
      await downloadAllModels(setStep, setProgress);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore download');
      setIsDownloading(false);
    }
  }, [router]);

  const handleSkip = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const isActive = isDownloading && step !== 'done';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.icon}>🧠</Text>
      <Text style={styles.title}>Setup modelli AI</Text>
      <Text style={styles.subtitle}>
        Weva usa modelli AI on-device.{'\n'}Scaricali ora o al primo utilizzo.
      </Text>

      {isActive && (
        <View style={styles.progressContainer}>
          <Text style={styles.stepLabel}>{STEP_LABELS[step]}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!isActive && (
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={handleDownload}>
            <Text style={styles.primaryText}>Scarica modelli (~2.5GB)</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Salta (scarica dopo)</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Modelli inclusi</Text>
        <Text style={styles.infoItem}>Whisper Small — trascrizione audio (~150MB)</Text>
        <Text style={styles.infoItem}>Phi-3 Mini — generazione preventivi (~2.3GB)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  progressContainer: { width: '80%', alignItems: 'center', marginBottom: Spacing.lg },
  stepLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: Spacing.xs },
  error: { color: Colors.accent, fontSize: FontSize.sm, marginBottom: Spacing.md, textAlign: 'center' },
  actions: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  primaryText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  skipBtn: { paddingVertical: Spacing.sm },
  skipText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  infoItem: { fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.xs },
});
