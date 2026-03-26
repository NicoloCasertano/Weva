import { isModelDownloaded, downloadModel } from './whisperService';
import { isLlamaModelDownloaded, downloadLlamaModel } from './llamaService';

export type DownloadStep = 'checking' | 'whisper' | 'llama' | 'done';

export async function checkModelsStatus(): Promise<{ whisper: boolean; llama: boolean }> {
  const [whisper, llama] = await Promise.all([isModelDownloaded(), isLlamaModelDownloaded()]);
  return { whisper, llama };
}

export async function downloadAllModels(
  onStep: (step: DownloadStep) => void,
  onProgress: (progress: number) => void
): Promise<void> {
  onStep('checking');
  const status = await checkModelsStatus();

  if (!status.whisper) { onStep('whisper'); await downloadModel(onProgress); }
  if (!status.llama) { onStep('llama'); onProgress(0); await downloadLlamaModel(onProgress); }

  onStep('done');
}

export async function allModelsReady(): Promise<boolean> {
  const s = await checkModelsStatus();
  return s.whisper && s.llama;
}
