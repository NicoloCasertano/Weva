import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import { useAudioRecorder } from '../../src/hooks/useAudioRecorder';
import {
  transcribeAudio,
  isModelDownloaded,
  downloadModel,
  loadModel,
  type TranscribeStatus,
} from '../../src/services/whisperService';
import {
  extractQuoteFromTranscription,
  isLlamaModelDownloaded,
  downloadLlamaModel,
  loadLlamaModel,
} from '../../src/services/llamaService';
import { saveQuote } from '../../src/services/database';
import type { Quote } from '@weva/shared';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RecordScreen() {
  const router = useRouter();
  const { state, duration, audioUri, startRecording, stopRecording, resetRecording, error } =
    useAudioRecorder();

  const [transcribeStatus, setTranscribeStatus] = useState<TranscribeStatus>('idle');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedQuote, setGeneratedQuote] = useState<Quote | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTranscribe = useCallback(async () => {
    if (!audioUri) return;

    try {
      // Check e download modello
      const downloaded = await isModelDownloaded();
      if (!downloaded) {
        setTranscribeStatus('loading_model');
        setStatusMessage('Scaricamento modello Whisper (~150MB)...');
        await downloadModel((progress) => setModelProgress(progress));
      }

      setTranscribeStatus('loading_model');
      setStatusMessage('Caricamento modello...');
      await loadModel();

      setTranscribeStatus('transcribing');
      setStatusMessage('Trascrizione in corso...');
      const result = await transcribeAudio(audioUri);

      setTranscription(result.text);
      setTranscribeStatus('done');
      setStatusMessage('');
    } catch (err) {
      setTranscribeStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Errore trascrizione');
    }
  }, [audioUri]);

  const handleGenerateQuote = useCallback(async () => {
    if (!transcription) return;
    try {
      setIsGenerating(true);
      const downloaded = await isLlamaModelDownloaded();
      if (!downloaded) {
        setStatusMessage('Scaricamento modello LLM (~2.3GB)...');
        await downloadLlamaModel((p) => setModelProgress(p));
      }
      setStatusMessage('Caricamento modello LLM...');
      setModelProgress(0);
      await loadLlamaModel((p) => setModelProgress(p));
      setStatusMessage('Generazione preventivo...');
      const quote = await extractQuoteFromTranscription(transcription);
      await saveQuote(quote);
      setGeneratedQuote(quote);
      setStatusMessage('');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Errore generazione');
    } finally {
      setIsGenerating(false);
    }
  }, [transcription]);

  const handleReset = useCallback(() => {
    resetRecording();
    setTranscription(null);
    setTranscribeStatus('idle');
    setStatusMessage('');
    setModelProgress(0);
    setGeneratedQuote(null);
    setIsGenerating(false);
  }, [resetRecording]);

  const isProcessing = transcribeStatus === 'loading_model' || transcribeStatus === 'transcribing';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weva</Text>
      <Text style={styles.subtitle}>
        Registra una nota audio{'\n'}e trasformala in preventivo
      </Text>

      {/* Stato registrazione */}
      {state === 'recording' && (
        <Text style={styles.timer}>{formatDuration(duration)}</Text>
      )}

      {/* Pulsante registrazione */}
      <Pressable
        style={[
          styles.recordButton,
          state === 'recording' && styles.recordButtonActive,
          (state === 'stopped' || isProcessing) && styles.recordButtonDisabled,
        ]}
        onPressIn={state === 'idle' ? () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          startRecording();
        } : undefined}
        onPressOut={state === 'recording' ? () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          stopRecording();
        } : undefined}
        disabled={state === 'stopped' || isProcessing}
      >
        <Text style={styles.recordIcon}>
          {state === 'recording' ? '⏹️' : '🎤'}
        </Text>
      </Pressable>

      <Text style={styles.hint}>
        {state === 'idle' && 'Tieni premuto per registrare'}
        {state === 'recording' && 'Rilascia per fermare'}
        {state === 'stopped' && !isProcessing && 'Registrazione completata'}
      </Text>

      {/* Errore */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Azioni post-registrazione */}
      {state === 'stopped' && transcribeStatus !== 'done' && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleTranscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={Colors.text} size="small" />
            ) : (
              <Text style={styles.actionText}>Trascrivi</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleReset}
            disabled={isProcessing}
          >
            <Text style={styles.actionTextSecondary}>Riprova</Text>
          </Pressable>
        </View>
      )}

      {/* Progress download modello */}
      {(transcribeStatus === 'loading_model' || isGenerating) && modelProgress > 0 && modelProgress < 1 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${modelProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(modelProgress * 100)}%</Text>
        </View>
      )}

      {/* Status message */}
      {statusMessage !== '' && (
        <Text style={styles.statusText}>{statusMessage}</Text>
      )}

      {/* Risultato trascrizione */}
      {transcription && !generatedQuote && (
        <View style={styles.transcriptionCard}>
          <Text style={styles.transcriptionLabel}>Trascrizione</Text>
          <Text style={styles.transcriptionText}>{transcription}</Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleGenerateQuote}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color={Colors.text} size="small" />
              ) : (
                <Text style={styles.actionText}>Genera preventivo</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleReset}
              disabled={isGenerating}
            >
              <Text style={styles.actionTextSecondary}>Nuova registrazione</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Preview preventivo generato */}
      {generatedQuote && (
        <View style={styles.transcriptionCard}>
          <Text style={styles.transcriptionLabel}>Preventivo generato</Text>
          <Text style={styles.quoteClient}>{generatedQuote.clientName}</Text>
          {generatedQuote.items.map((item) => (
            <View key={item.id} style={styles.quoteItem}>
              <Text style={styles.quoteItemName}>{item.name}</Text>
              <Text style={styles.quoteItemPrice}>
                {item.unitPrice > 0 ? `${item.unitPrice.toFixed(2)} x ${item.quantity}` : 'Prezzo da definire'}
              </Text>
            </View>
          ))}
          {generatedQuote.notes !== '' && (
            <Text style={styles.quoteNotes}>{generatedQuote.notes}</Text>
          )}

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push(`/quote/${generatedQuote.id}`)}
            >
              <Text style={styles.actionText}>Apri dettaglio</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleReset}
            >
              <Text style={styles.actionTextSecondary}>Nuova</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  timer: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
    fontVariant: ['tabular-nums'],
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordIcon: {
    fontSize: 48,
  },
  hint: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  actionTextSecondary: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  progressContainer: {
    width: '80%',
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  transcriptionCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transcriptionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  transcriptionText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  quoteClient: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  quoteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quoteItemName: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  quoteItemPrice: {
    fontSize: FontSize.md,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  quoteNotes: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
