import React from 'react';

const PaymentStatus = ({ status, checking, onCheckAgain }) => {
  if (!status) return null;

  const statusMessages = {
    PENDING: {
      text: 'กำลังรอการชำระเงิน',
      color: 'orange'
    },
    SUCCESS: {
      text: 'ชำระเงินสำเร็จแล้ว',
      color: 'green'
    },
    FAILED: {
      text: 'การชำระเงินไม่สำเร็จ',
      color: 'red'
    }
  };

  return (
    <div className="payment-status">
      <div className={`status-box ${status.toLowerCase()}`}>
        <h3>สถานะการชำระเงิน:</h3>
        <p style={{ color: statusMessages[status].color }}>
          {statusMessages[status].text}
        </p>
        {status === 'PENDING' && (
          <button 
            onClick={onCheckAgain} 
            disabled={checking}
            className="check-again-btn"
          >
            {checking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบอีกครั้ง'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;