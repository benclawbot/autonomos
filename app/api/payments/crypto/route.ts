import { createCryptoPaymentLink, checkCryptoPaymentStatus } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create': {
        const result = await createCryptoPaymentLink({
          amount: params.amount,
          cryptoCurrency: params.cryptoCurrency || 'BTC',
          orderId: params.orderId,
          description: params.description,
          customerEmail: params.email,
        });

        return NextResponse.json(result);
      }

      case 'status': {
        const result = await checkCryptoPaymentStatus(params.invoiceId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Crypto payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
