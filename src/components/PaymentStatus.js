import React from 'react';

const PaymentStatus = ({ status, checking, onCheckAgain }) => {
  if (!status) return null;

  const statusConfig = {
    PENDING: {
      text: 'กำลังรอการชำระเงิน',
      emoji: '⏳',
      color: '#FFA500',
      bgColor: '#FFF4E5'
    },
    SUCCESS: {
      text: 'ชำระเงินสำเร็จแล้ว!',
      emoji: '✅',
      color: '#28A745',
      bgColor: '#E6F7EE'
    },
    FAILED: {
      text: 'การชำระเงินไม่สำเร็จ',
      emoji: '❌',
      color: '#DC3545',
      bgColor: '#FFEBEE'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <div 
      className="payment-status"
      style={{
        backgroundColor: config.bgColor,
        borderLeft: `4px solid ${config.color}`
      }}
    >
      <div className="status-content">
        <span className="status-emoji">{config.emoji}</span>
        <span 
          className="status-text"
          style={{ color: config.color }}
        >
          {config.text}
        </span>
      </div>
      
      {status === 'PENDING' && (
        <button 
          onClick={onCheckAgain} 
          disabled={checking}
          className="check-again-btn"
        >
          {checking ? (
            <>
              <span className="loading-spinner"></span>
              กำลังตรวจสอบ...
            </>
          ) : 'ตรวจสอบอีกครั้ง'}
        </button>
      )}
    </div>
  );
};

export default PaymentStatus;