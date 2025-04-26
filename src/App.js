import React, { useState, useEffect } from 'react';
import AmountForm from './components/AmountForm';
import QRGenerator from './components/QRGenerator';
import PaymentStatus from './components/PaymentStatus.js';
import './styles/App.css';

function App() {
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);

  const handleGenerateQR = async (amount) => {
    try {
      setLoading(true);
      setError('');
      setPaymentStatus(null);
      
      const response = await fetch('/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setQrCode(data.qrCode);
      setTransactionId(data.transactionId);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
      setQrCode('');
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!transactionId) return;
    
    try {
      setCheckingPayment(true);
      const response = await fetch(`/check-payment/${transactionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check payment');
      }

      setPaymentStatus(data.status);
      
      // หากยังไม่สำเร็จ ให้ตรวจสอบอีกครั้งใน 5 วินาที
      if (data.status !== 'SUCCESS') {
        setTimeout(checkPayment, 5000);
      }
    } catch (err) {
      console.error('Payment check error:', err);
    } finally {
      setCheckingPayment(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      checkPayment();
    }
  }, [transactionId]);

  return (
    <div className="app">
      <h1>PromptPay QR Generator</h1>
      <div className="container">
        <AmountForm onSubmit={handleGenerateQR} loading={loading} />
        {error && <p className="error">เกิดข้อผิดพลาด: {error}</p>}
        <QRGenerator 
          qrCode={qrCode} 
          loading={loading} 
          transactionId={transactionId}
        />
        <PaymentStatus 
          status={paymentStatus} 
          checking={checkingPayment}
          onCheckAgain={checkPayment}
        />
      </div>
    </div>
  );
}

export default App;