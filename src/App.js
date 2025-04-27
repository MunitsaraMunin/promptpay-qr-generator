import React, { useState, useEffect } from 'react';
import './styles/App.css';

function App() {
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Reset all
  const resetAll = () => {
    setAmount('');
    setQrCode('');
    setTransactionId('');
    setPaymentStatus(null);
    setError('');
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPaymentStatus(null);

      const response = await fetch('/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setQrCode(data.qrCode);
      setTransactionId(data.transactionId);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'สร้าง QR Code ไม่สำเร็จ กรุณาลองใหม่');
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

      if (data.status !== 'SUCCESS') {
        setTimeout(checkPayment, 5000); // เช็คอีกครั้งใน 5 วิ
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
      <div className="card">
        <header>
          <h1>PromptPay QR Generator</h1>
          <p className="subtitle">ชำระเงินง่ายๆ ปลอดภัย เข้าเป๋ามุมุ อิอิ</p>
        </header>

        {!qrCode ? (
          <form onSubmit={handleGenerateQR} className="payment-form">
            <div className="input-group">
              <label htmlFor="amount">จำนวนเงิน (บาท)</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  กำลังสร้าง...
                </>
              ) : (
                'สร้าง QR Code'
              )}
            </button>
          </form>
        ) : (
          <div className="qr-result">
            <div className="qr-container">
              <img src={qrCode} alt="QR Code พร้อมเพย์" />
              {amount && (
                <div className="amount-badge">฿{parseFloat(amount).toFixed(2)}</div>
              )}
            </div>

            <div className={`status-box ${paymentStatus?.toLowerCase()}`}>
              {paymentStatus === null || paymentStatus === 'PENDING' ? (
                <>
                  <span className="spinner small"></span>
                  <p>กำลังรอการชำระเงิน...</p>
                </>
              ) : paymentStatus === 'SUCCESS' ? (
                <>
                  <span className="icon success">✓</span>
                  <p>ชำระเงินสำเร็จ!</p>
                </>
              ) : paymentStatus === 'FAILED' ? (
                <>
                  <span className="icon error">✕</span>
                  <p>ชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง</p>
                </>
              ) : null}
            </div>

            <button onClick={resetAll} className="secondary-btn">
              สร้างรายการใหม่
            </button>
          </div>
        )}
      </div>

      <footer>
        <p>© {new Date().getFullYear()} ระบบสร้าง QR Code พร้อมเพย์</p>
      </footer>
    </div>
  );
}

export default App;
