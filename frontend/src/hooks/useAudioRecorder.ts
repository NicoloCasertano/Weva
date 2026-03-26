import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export type RecordingState = 'idle' | 'recording' | 'stopped';

const RECORDING_PRESET = {
  android: {
    extension: '.wav', outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000, numberOfChannels: 1, bitRate: 256000,
  },
  ios: {
    extension: '.wav', outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH, sampleRate: 16000,
    numberOfChannels: 1, bitRate: 256000, linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false, linearPCMIsFloat: false,
  },
  web: {},
} as const;

const DEST_DIR = `${FileSystem.documentDirectory}recordings/`;

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { setError('Permesso microfono negato'); return; }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(RECORDING_PRESET);

      recordingRef.current = recording;
      setState('recording');
      setDuration(0);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      setError(`Errore registrazione: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (!recordingRef.current) return null;

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        if (!(await FileSystem.getInfoAsync(DEST_DIR)).exists)
          await FileSystem.makeDirectoryAsync(DEST_DIR, { intermediates: true });
        const destUri = `${DEST_DIR}recording_${Date.now()}.wav`;
        await FileSystem.copyAsync({ from: uri, to: destUri });
        setAudioUri(destUri);
        setState('stopped');
        return destUri;
      }
      setState('idle');
      return null;
    } catch (err) {
      setError(`Errore stop: ${err instanceof Error ? err.message : String(err)}`);
      setState('idle');
      return null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    setAudioUri(null); setDuration(0); setState('idle'); setError(null);
  }, []);

  return { state, duration, audioUri, startRecording, stopRecording, resetRecording, error };
}
