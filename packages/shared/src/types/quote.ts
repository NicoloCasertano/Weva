export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: QuoteItem[];
  notes: string;
  createdAt: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}
