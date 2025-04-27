import React from 'react';

function QRGenerator({ qrCode, loading, transactionId }) {
  if (loading) {
    return (
      <div className="qr-loading">
        <div className="loading-spinner"></div>
        <p>กำลังสร้าง QR Code...</p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="qr-placeholder">
        <img 
          src="/qr-placeholder.png" 
          alt="QR Code Placeholder"
          className="placeholder-image"
        />
        <p>กรุณากรอกจำนวนเงินเพื่อสร้าง QR Code</p>
      </div>
    );
  }

  return (
    <div className="qr-container">
      <h2>QR Code สำหรับชำระเงิน</h2>
      <img src={qrCode} alt="PromptPay QR Code" className="qr-code" />
      <div className="transaction-info">
        <p>เลขที่อ้างอิง: <span>{transactionId}</span></p>
      </div>
      <p className="scan-instruction">สแกน QR Code ด้านบนเพื่อชำระเงิน</p>
    </div>
  );
}

export default QRGenerator;