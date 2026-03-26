import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Quote } from '@weva/shared';
import type { FreelancerProfile } from '@weva/shared';
import { buildQuoteHtml } from '@weva/shared';

export async function generateAndSharePdf(quote: Quote, profile: FreelancerProfile): Promise<void> {
  const html = buildQuoteHtml(quote, profile);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Preventivo - ${quote.clientName}`,
    UTI: 'com.adobe.pdf',
  });
}
