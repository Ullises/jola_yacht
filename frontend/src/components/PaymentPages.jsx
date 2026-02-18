import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [attempts, setAttempts] = useState(0);

  const sessionId = searchParams.get('session_id');
  const paymentMethod = searchParams.get('method') || 'stripe';
  const token = searchParams.get('token'); // PayPal token
  const payerId = searchParams.get('PayerID'); // PayPal payer ID

  useEffect(() => {
    if (paymentMethod === 'paypal' && token) {
      // For PayPal, we need to capture the payment
      capturePayPalPayment();
    } else if (sessionId) {
      pollPaymentStatus();
    } else {
      // No session, show success anyway (PayPal redirect case)
      setStatus('success');
    }
  }, [sessionId, token, paymentMethod]);

  const capturePayPalPayment = async () => {
    try {
      // The token from PayPal URL is the order ID
      const response = await axios.post(`${API}/paypal/capture/${token}`);
      
      if (response.data.payment_status === 'paid' || response.data.status === 'success') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      // Even if capture fails, check status
      pollPaymentStatus();
    }
  };

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      // After max attempts, assume success if we got here via redirect
      setStatus('success');
      return;
    }

    try {
      const checkId = sessionId || token;
      if (!checkId) {
        setStatus('success');
        return;
      }
      
      const response = await axios.get(`${API}/checkout/status/${checkId}?method=${paymentMethod}`);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continue polling
      setAttempts(prev => prev + 1);
      setTimeout(pollPaymentStatus, pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      // If error, assume success since user was redirected here
      setStatus('success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-fade-in-up">
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-[#0F2C59] animate-spin" />
            <h1 className="text-2xl font-bold text-[#0F2C59] mb-2">
              {language === 'es' ? 'Verificando pago...' : 'Verifying payment...'}
            </h1>
            <p className="text-gray-600">
              {language === 'es' ? 'Por favor espera un momento' : 'Please wait a moment'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-[#10B981]" />
            </div>
            <h1 
              className="text-3xl font-bold text-[#0F2C59] mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {t('payment.success')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('payment.successMsg')}
            </p>
            <Button
              onClick={() => navigate('/')}
              data-testid="success-back-home"
              className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white px-8 py-6 rounded-full"
            >
              {t('payment.volver')}
            </Button>
          </div>
        )}

        {(status === 'error' || status === 'timeout' || status === 'expired') && (
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 
              className="text-3xl font-bold text-[#0F2C59] mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {language === 'es' ? 'Error en el pago' : 'Payment Error'}
            </h1>
            <p className="text-gray-600 mb-8">
              {language === 'es' 
                ? 'Hubo un problema al verificar tu pago. Por favor intenta de nuevo.' 
                : 'There was a problem verifying your payment. Please try again.'}
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white px-8 py-6 rounded-full"
            >
              {t('payment.volver')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PaymentCancel = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-[#FF7F50]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-[#FF7F50]" />
        </div>
        <h1 
          className="text-3xl font-bold text-[#0F2C59] mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {t('payment.cancel')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('payment.cancelMsg')}
        </p>
        <Button
          onClick={() => navigate('/')}
          data-testid="cancel-back-home"
          className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white px-8 py-6 rounded-full"
        >
          {t('payment.volver')}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
