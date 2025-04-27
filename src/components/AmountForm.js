import React, { useState } from 'react';

function AmountForm({ onSubmit, loading }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onSubmit(numAmount);
    } else {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง (ต้องมากกว่า 0 บาท)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="amount-form">
      <div className="form-group">
        <label htmlFor="amount">
          <span role="img" aria-label="money">💸</span> จำนวนเงิน (บาท):
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0.01"
          placeholder="เช่น 150.50"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            กำลังสร้าง QR Code...
          </>
        ) : (
          <>
            <span role="img" aria-label="qr">🔳</span> สร้าง QR Code
          </>
        )}
      </button>
    </form>
  );
}

export default AmountForm;