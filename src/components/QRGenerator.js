import React from 'react';

function QRGenerator({ qrCode, loading }) {
  if (loading) {
    return (
      <div className="qr-loading">
        <p>กำลังสร้าง QR Code...</p>
      </div>
    );
  }

  if (!qrCode) {
    return null;
  }

  return (
    <div className="qr-container">
      <h2>QR Code PromptPay</h2>
      <img src={qrCode} alt="PromptPay QR Code" className="qr-code" />
      <p className="instruction">สแกน QR Code ด้านบนเพื่อชำระเงินผ่านแอปธนาคาร</p>
      <p className="note">* ระบบนี้สร้าง QR Code ตามมาตรฐาน PromptPay</p>
    </div>
  );
}

export default QRGenerator;