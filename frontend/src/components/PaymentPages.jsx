import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    // PayPal redirects back with ?token={order_id}
    const paypalOrderId = searchParams.get('token');
    if (paypalOrderId) {
      setCapturing(true);
      axios
        .post(`${API}/checkout/paypal/capture/${paypalOrderId}`)
        .catch((err) => console.error('PayPal capture error:', err))
        .finally(() => setCapturing(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {capturing ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2C59] mx-auto mb-6" />
        ) : (
          <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#10B981]" />
          </div>
        )}
        <h1
          className="text-3xl font-bold text-[#0F2C59] mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {t('payment.success')}
        </h1>
        <p className="text-gray-600 mb-8">{t('payment.successMsg')}</p>
        <Button
          onClick={() => navigate('/')}
          data-testid="success-back-home"
          className="bg-[#0F2C59] hover:bg-[#0a1f3d] text-white px-8 py-6 rounded-full"
        >
          {t('payment.volver')}
        </Button>
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
