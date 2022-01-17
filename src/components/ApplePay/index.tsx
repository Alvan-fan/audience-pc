/**
 * @file apple支付组件
 */

import React, { useEffect, useState } from 'react';

import {
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js';

const ApplePay = () => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Demo total',
          amount: 1099,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      // Check the availability of the Payment Request API.
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr as any);
        }
      });
    }
  }, [stripe]);

  // console.log(paymentRequest);
  if (paymentRequest) {
    //@ts-ignore
    return <PaymentRequestButtonElement options={{ paymentRequest }} />;
  }

  // Use a traditional checkout form.
  return null;
};

export default ApplePay;
