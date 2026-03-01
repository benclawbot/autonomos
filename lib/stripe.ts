// Stripe payment integration for Autonomos
// Install: npm install stripe

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create a checkout session for payment
export async function createCheckoutSession({
  priceAmount,
  currency = 'usd',
  productName,
  customerEmail,
  metadata = {},
}: {
  priceAmount: number;
  currency?: string;
  productName: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: productName,
          },
          unit_amount: Math.round(priceAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    customer_email: customerEmail,
    metadata,
  });

  return session;
}

// Create a checkout session for subscription
export async function createSubscriptionSession({
  priceId,
  customerEmail,
  metadata = {},
}: {
  priceId: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    customer_email: customerEmail,
    metadata,
  });

  return session;
}

// Create payment intent for custom checkout flow
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata = {},
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });

  return paymentIntent;
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// Get customer by email
export async function getCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0] || null;
}

// Create or get customer
export async function getOrCreateCustomer({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  const existing = await getCustomerByEmail(email);
  
  if (existing) {
    return existing;
  }

  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

// Create refund
export async function createRefund({
  paymentIntentId,
  amount,
}: {
  paymentIntentId: string;
  amount?: number;
}) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}

// For marketplace: Create connected account (Stripe Connect)
export async function createConnectedAccount(email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}

// Generate onboarding link for connected account
export async function createAccountLink(accountId: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/connect/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/connect/dashboard`,
    type: 'account_onboarding',
  });

  return accountLink;
}

// Transfer funds to connected account (marketplace payouts)
export async function transferToConnectedAccount({
  amount,
  connectedAccountId,
  transferGroup,
}: {
  amount: number;
  connectedAccountId: string;
  transferGroup?: string;
}) {
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    destination: connectedAccountId,
    transfer_group: transferGroup,
  });
}

// Check if webhook is for successful payment
export function isPaymentSucceeded(event: Stripe.Event) {
  return (
    event.type === 'payment_intent.succeeded' ||
    event.type === 'checkout.session.completed'
  );
}
