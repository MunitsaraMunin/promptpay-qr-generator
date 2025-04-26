import React, { useState } from 'react';

function AmountForm({ onSubmit, loading }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onSubmit(numAmount);
    } else {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง (ต้องมากกว่า 0)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="amount-form">
      <div className="form-group">
        <label htmlFor="amount">จำนวนเงิน (บาท):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0.01"
          placeholder="เช่น 100.50"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'กำลังสร้าง QR Code...' : 'สร้าง QR Code PromptPay'}
      </button>
    </form>
  );
}

export default AmountForm;