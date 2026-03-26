declare module 'whisper.rn' {
  export interface TranscribeOptions {
    language?: string;
    maxLen?: number;
    translate?: boolean;
    onNewSegments?: (result: { result: string; segments: TranscribeSegment[] }) => void;
  }

  export interface TranscribeSegment {
    text: string;
    t0: number;
    t1: number;
  }

  export interface TranscribeResult {
    result: string;
    language: string;
    segments: TranscribeSegment[];
    isAborted: boolean;
  }

  export interface ContextOptions {
    filePath: string;
    isBundleAsset?: boolean;
    useGpu?: boolean;
    useCoreMLIos?: boolean;
    useFlashAttn?: boolean;
  }

  export class WhisperContext {
    transcribe(
      filePathOrBase64: string | number,
      options?: TranscribeOptions
    ): { stop: () => Promise<void>; promise: Promise<TranscribeResult> };

    release(): Promise<void>;
  }

  export function initWhisper(options: ContextOptions): Promise<WhisperContext>;
  export function releaseAllWhisper(): Promise<void>;
}
