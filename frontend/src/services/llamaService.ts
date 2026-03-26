import { initLlama, type LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system/legacy';
import type { Quote } from '@weva/shared';

const MODEL_DIR = `${FileSystem.documentDirectory}models/`;
const MODEL_PATH = `${MODEL_DIR}Phi-3-mini-4k-instruct-Q4_K_M.gguf`;
const MODEL_URL =
  'https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf';

let llamaCtx: LlamaContext | null = null;

export async function isLlamaModelDownloaded(): Promise<boolean> {
  return (await FileSystem.getInfoAsync(MODEL_PATH)).exists;
}

export async function downloadLlamaModel(onProgress?: (progress: number) => void): Promise<void> {
  if (!(await FileSystem.getInfoAsync(MODEL_DIR)).exists)
    await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
  if (await isLlamaModelDownloaded()) return;

  const dl = FileSystem.createDownloadResumable(
    MODEL_URL, MODEL_PATH, {},
    (p) => onProgress?.(p.totalBytesWritten / p.totalBytesExpectedToWrite)
  );
  const result = await dl.downloadAsync();
  if (!result?.uri) throw new Error('Download modello LLM fallito');
}

export async function loadLlamaModel(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (llamaCtx) return;
  if (!(await isLlamaModelDownloaded())) {
    throw new Error('Modello LLM non scaricato');
  }
  llamaCtx = await initLlama({ model: MODEL_PATH, n_ctx: 2048, n_gpu_layers: 0 }, onProgress);
}

const SYSTEM_PROMPT = `Sei un assistente che estrae dati da trascrizioni audio di freelancer italiani per creare preventivi.
Rispondi SOLO con JSON valido, senza markdown, senza spiegazioni.

Schema JSON richiesto:
{
  "clientName": "nome cliente o 'Da definire'",
  "items": [{"name": "nome voce", "description": "descrizione breve", "quantity": 1, "unitPrice": 0}],
  "notes": "note aggiuntive o stringa vuota"
}

Regole:
- Estrai ogni lavoro/servizio menzionato come item separato
- Se il prezzo non è menzionato, metti unitPrice: 0
- Se la quantità non è chiara, metti 1
- Se il cliente non è nominato, usa "Da definire"
- Le note contengono info extra (scadenze, condizioni, ecc)`;

interface LlmQuoteData {
  clientName: string;
  items: { name: string; description: string; quantity: number; unitPrice: number }[];
  notes: string;
}

export async function extractQuoteFromTranscription(transcription: string): Promise<Quote> {
  if (!llamaCtx) await loadLlamaModel();

  const prompt = `<|system|>\n${SYSTEM_PROMPT}<|end|>\n<|user|>\nTrascrizione: "${transcription}"<|end|>\n<|assistant|>\n`;

  const result = await llamaCtx!.completion({
    prompt,
    n_predict: 1024,
    temperature: 0.1,
    stop: ['<|end|>', '<|user|>'],
  });

  const jsonText = result.text.trim();
  let parsed: LlmQuoteData;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // Tenta di estrarre JSON da eventuale testo extra
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('LLM non ha prodotto JSON valido');
    parsed = JSON.parse(match[0]);
  }

  const now = new Date();

  return {
    id: `q_${Date.now()}`,
    clientName: parsed.clientName || 'Da definire',
    items: (parsed.items || []).map((item, i) => ({
      id: `item_${Date.now()}_${i}`,
      name: item.name || 'Voce',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
    })),
    notes: parsed.notes || '',
    createdAt: now.toISOString(),
    validUntil: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    status: 'draft',
  };
}

