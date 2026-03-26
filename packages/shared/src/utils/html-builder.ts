import type { Quote } from '../types/quote';
import type { FreelancerProfile } from '../types/profile';

export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function buildQuoteHtml(quote: Quote, profile: FreelancerProfile): string {
  const total = quote.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const hasProfile = profile.name !== '';

  const itemsRows = quote.items.map((item) => `
    <tr>
      <td>${escHtml(item.name)}${item.description ? `<br><small style="color:#666">${escHtml(item.description)}</small>` : ''}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${item.unitPrice > 0 ? `€ ${item.unitPrice.toFixed(2)}` : '—'}</td>
      <td style="text-align:right;font-weight:600">${item.unitPrice > 0 ? `€ ${(item.quantity * item.unitPrice).toFixed(2)}` : '—'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,Helvetica,Arial,sans-serif; color:#1a1a2e; padding:40px; font-size:14px; }
  .header { display:flex; justify-content:space-between; margin-bottom:32px; border-bottom:2px solid #6C63FF; padding-bottom:16px; }
  .brand { font-size:28px; font-weight:700; color:#6C63FF; }
  .profile { text-align:right; font-size:12px; color:#555; line-height:1.6; }
  .meta { display:flex; justify-content:space-between; margin-bottom:24px; }
  .meta-block { }
  .meta-label { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
  .meta-value { font-size:14px; font-weight:600; margin-top:2px; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  th { background:#f5f5ff; color:#6C63FF; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; padding:10px 8px; text-align:left; }
  td { padding:10px 8px; border-bottom:1px solid #eee; }
  .total-row { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .total-box { background:#6C63FF; color:white; padding:12px 24px; border-radius:8px; font-size:18px; font-weight:700; }
  .notes { background:#f9f9ff; border-left:3px solid #6C63FF; padding:12px 16px; margin-bottom:24px; font-size:13px; color:#555; }
  .footer { font-size:11px; color:#999; text-align:center; margin-top:32px; padding-top:16px; border-top:1px solid #eee; }
</style></head><body>
  <div class="header">
    <div class="brand">${hasProfile ? escHtml(profile.name) : 'Weva'}</div>
    <div class="profile">
      ${hasProfile ? `${profile.vatNumber ? `P.IVA ${escHtml(profile.vatNumber)}<br>` : ''}${profile.email ? `${escHtml(profile.email)}<br>` : ''}${profile.phone ? `${escHtml(profile.phone)}<br>` : ''}${profile.address ? escHtml(profile.address) : ''}` : ''}
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <div class="meta-label">Cliente</div>
      <div class="meta-value">${escHtml(quote.clientName)}</div>
      ${quote.clientEmail ? `<div style="font-size:12px;color:#666;margin-top:2px">${escHtml(quote.clientEmail)}</div>` : ''}
      ${quote.clientPhone ? `<div style="font-size:12px;color:#666">${escHtml(quote.clientPhone)}</div>` : ''}
    </div>
    <div class="meta-block" style="text-align:right">
      <div class="meta-label">Data</div>
      <div class="meta-value">${formatDate(quote.createdAt)}</div>
      <div class="meta-label" style="margin-top:8px">Valido fino</div>
      <div class="meta-value">${formatDate(quote.validUntil)}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Descrizione</th><th style="text-align:center">Qtà</th><th style="text-align:right">Prezzo</th><th style="text-align:right">Totale</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <div class="total-row">
    <div class="total-box">${total > 0 ? `Totale: € ${total.toFixed(2)}` : 'Totale: Da quotare'}</div>
  </div>

  ${quote.notes ? `<div class="notes"><strong>Note:</strong> ${escHtml(quote.notes)}</div>` : ''}

  <div class="footer">Preventivo generato con Weva</div>
</body></html>`;
}
