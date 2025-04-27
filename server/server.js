const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const app = express();
const PORT = 5000;

// จำลองฐานข้อมูล
const paymentsDB = new Map();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
  methods: ['GET', 'POST']
}));
app.use(express.json());

const PROMPTPAY_ID = '0826464321'; // เปลี่ยนเป็นเบอร์โทรหรือเลขบัตรประชาชนของคุณ
const ID_TYPE = 'PHONE'; // 'PHONE' หรือ 'ID_CARD'

// ฟังก์ชันคำนวณ CRC16
function calculateCRC16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xFFFF;
}

// ฟังก์ชันสร้าง PromptPay payload ที่ถูกต้องตามมาตรฐาน
function generatePromptPayPayload(id, idType, amount) {
  // ข้อมูลผู้รับเงิน
  const recipientType = idType === 'PHONE' ? 
    `01130066${id.substring(1)}` : // สำหรับเบอร์โทร (เปลี่ยน 0 เป็น 66)
    `0213${id}`; // สำหรับเลขบัตรประชาชน

  // ส่วนข้อมูล Merchant
  const merchantInfo = [
    '0016', // ความยาวของ Merchant Account Information (Fixed)
    'A000000677010111', // PromptPay Merchant ID
    recipientType
  ].join('');

  // ส่วนข้อมูล Transaction
  const transactionInfo = [
    '5303764', // Currency (THB)
    amount ? '54' + amount.toFixed(2).length.toString().padStart(2, '0') + amount.toFixed(2) : '', // Amount
    '5802TH', // Country Code (TH)
    '6304' // CRC16 placeholder
  ].join('');

  // รวม payload โดยยังไม่มี CRC
  const payloadWithoutCRC = [
    '000201', // Payload Format Indicator
    '010211', // Point of Initiation Method (Dynamic QR)
    '29' + merchantInfo.length.toString().padStart(2, '0') + merchantInfo, // Merchant Account Info
    transactionInfo
  ].join('');

  // คำนวณ CRC
  const crc = calculateCRC16(payloadWithoutCRC);
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  // รวม payload ที่สมบูรณ์
  return payloadWithoutCRC + crcHex;
}

// API สร้าง QR Code
app.post('/generate-qr', async (req, res) => {
  try {
    const { amount } = req.body;
    const transactionId = `TXN-${Date.now()}`;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'กรุณากรอกจำนวนเงินที่ถูกต้อง' });
    }

    // สร้าง payload ที่ถูกต้องตามมาตรฐาน
    const payload = generatePromptPayPayload(PROMPTPAY_ID, ID_TYPE, parseFloat(amount));
    
    // สร้าง QR Code
    const qrCode = await qrcode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1
    });

    // บันทึก transaction
    paymentsDB.set(transactionId, {
      amount,
      status: 'PENDING',
      createdAt: new Date(),
      qrCode,
      payload // สำหรับ debug
    });

    res.json({ 
      qrCode,
      transactionId
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการสร้าง QR Code',
      details: error.message 
    });
  }
});

// API ตรวจสอบสถานะการชำระเงิน
app.get('/check-payment/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = paymentsDB.get(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'ไม่พบรายการนี้' });
    }

    // จำลองการตรวจสอบ (ในระบบจริงให้เรียก API ธนาคาร)
    const status = Math.random() > 0.7 ? 'SUCCESS' : 'PENDING';
    
    // อัพเดทสถานะ
    transaction.status = status;
    paymentsDB.set(transactionId, transaction);

    res.json({ 
      status,
      amount: transaction.amount,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error checking payment:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
});

app.listen(PORT, () => {
  console.log(`PromptPay QR Generator Server running on http://localhost:${PORT}`);
});