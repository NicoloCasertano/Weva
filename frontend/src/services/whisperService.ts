import { initWhisper, WhisperContext } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';

const MODEL_DIR = `${FileSystem.documentDirectory}models/`;
const MODEL_PATH = `${MODEL_DIR}ggml-small.bin`;
const MODEL_URL =
  'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin';

export type TranscribeStatus = 'idle' | 'loading_model' | 'transcribing' | 'done' | 'error';

export interface TranscribeResult {
  text: string;
  segments: { text: string; t0: number; t1: number }[];
}

let whisperCtx: WhisperContext | null = null;

export async function isModelDownloaded(): Promise<boolean> {
  return (await FileSystem.getInfoAsync(MODEL_PATH)).exists;
}

export async function downloadModel(onProgress?: (progress: number) => void): Promise<void> {
  if (!(await FileSystem.getInfoAsync(MODEL_DIR)).exists)
    await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
  if (await isModelDownloaded()) return;

  const dl = FileSystem.createDownloadResumable(
    MODEL_URL, MODEL_PATH, {},
    (p) => onProgress?.(p.totalBytesWritten / p.totalBytesExpectedToWrite)
  );
  const result = await dl.downloadAsync();
  if (!result?.uri) throw new Error('Download modello fallito');
}

export async function loadModel(): Promise<void> {
  if (whisperCtx) return;
  if (!(await isModelDownloaded())) throw new Error('Modello non scaricato');
  whisperCtx = await initWhisper({ filePath: MODEL_PATH });
}

export async function transcribeAudio(audioUri: string): Promise<TranscribeResult> {
  if (!whisperCtx) await loadModel();

  const result = await whisperCtx!.transcribe(audioUri, {
    language: 'it',
    maxLen: 0,
    translate: false,
  }).promise;

  return {
    text: result.result.trim(),
    segments: result.segments.map((s: { text: string; t0: number; t1: number }) => ({
      text: s.text.trim(), t0: s.t0, t1: s.t1,
    })),
  };
}
