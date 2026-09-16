import { useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCardSection = ({ onReady }) => {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    onReady?.({ stripe, elements });
  }, [stripe, elements, onReady]);

  return (
    <div className="ch-stripe-box">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <p className="ch-stripe-hint">
        Pay securely with credit card, debit card, Apple Pay, or Google Pay.
      </p>
    </div>
  );
};

export default StripeCardSection;
