// Crypto payment integration for Autonomos using Plisio
// Install: npm install requests

import crypto from 'crypto';

interface PlisioConfig {
  apiKey: string;
  baseUrl?: string;
}

interface InvoiceSuccess {
  invoice_url: string;
  invoice_id: string;
  expected_amount: string;
  expected_currency: string;
}

interface InvoiceError {
  message?: string;
}

interface InvoiceResult {
  status: string;
  data?: InvoiceSuccess | InvoiceError;
}

export class PlisioClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PlisioConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://plisio.net/api/v1';
  }

  private generateSignature(data: Record<string, any>): string {
    // Sort and concatenate values
    const values = Object.values(data).filter(v => v !== undefined && v !== null).join('');
    return crypto
      .createHmac('sha512', this.apiKey)
      .update(values)
      .digest('hex');
  }

  async createInvoice(params: {
    amount: number;
    currency: string;
    orderId: string;
    description?: string;
    email?: string;
    callbackUrl?: string;
  }): Promise<InvoiceResult> {
    const endpoint = `${this.baseUrl}/invoices/create`;

    const data: Record<string, any> = {
      version: '1.0.0',
      public_key: this.apiKey,
      amount: String(params.amount),
      currency: params.currency,
      order_id: params.orderId,
    };

    if (params.description) data.description = params.description;
    if (params.email) data.email = params.email;
    if (params.callbackUrl) data.callback_url = params.callbackUrl;

    data.signature = this.generateSignature(data);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    return response.json();
  }

  async getInvoiceStatus(invoiceId: string): Promise<any> {
    const endpoint = `${this.baseUrl}/invoices/info`;

    const data = {
      invoice_id: invoiceId,
      hash: crypto.createHash('sha256').update(`${invoiceId}${this.apiKey}`).digest('hex'),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    return response.json();
  }

  async getExchangeRate(currency: string, sourceCurrency: string = 'USD'): Promise<number> {
    const endpoint = `${this.baseUrl}/utils/rate`;

    const data = {
      currency,
      source_currency: sourceCurrency,
      hash: crypto.createHash('sha256').update(`${currency}${sourceCurrency}${this.apiKey}`).digest('hex'),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    const result = await response.json();
    if (result.status === 'success') {
      return parseFloat(result.data.rate);
    }
    return 0;
  }
}

// Convenience functions for Next.js API routes
export async function createCryptoPaymentLink({
  amount,
  cryptoCurrency = 'BTC',
  orderId,
  description,
  customerEmail,
}: {
  amount: number;
  cryptoCurrency?: string;
  orderId: string;
  description?: string;
  customerEmail?: string;
}) {
  const plisio = new PlisioClient({ apiKey: process.env.PLISIO_API_KEY || '' });
  
  const result = await plisio.createInvoice({
    amount,
    currency: cryptoCurrency,
    orderId,
    description,
    email: customerEmail,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/crypto`,
  });
  
  if (result.status === 'success' && result.data && 'invoice_url' in result.data) {
    return {
      success: true,
      paymentUrl: result.data.invoice_url,
      invoiceId: result.data.invoice_id,
      amount: result.data.expected_amount,
      currency: result.data.expected_currency,
    };
  }
  
  const errorData = result.data as InvoiceError | undefined;
  return {
    success: false,
    error: errorData?.message || 'Failed to create payment',
  };
}

export async function checkCryptoPaymentStatus(invoiceId: string) {
  const plisio = new PlisioClient({ apiKey: process.env.PLISIO_API_KEY || '' });
  const result = await plisio.getInvoiceStatus(invoiceId);
  
  return {
    status: result.data?.status || 'pending',
    amountPaid: result.data?.amount_received || 0,
    confirmations: result.data?.confirmations || 0,
  };
}
