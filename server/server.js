const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const axios = require('axios'); // สำหรับเรียก API ภายนอก
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

const PROMPTPAY_ID = '0812345678';
const ID_TYPE = 'PHONE';

// สร้างฟังก์ชันตรวจสอบการชำระเงิน (Mock)
async function checkPaymentStatus(transactionId) {
  // ในระบบจริงควรเรียก API ธนาคารที่นี่
  // ตัวอย่าง Mock API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() > 0.5 ? 'SUCCESS' : 'PENDING'); // จำลอง 50% สำเร็จ
    }, 2000);
  });
}

// API สร้าง QR Code
app.post('/generate-qr', async (req, res) => {
  try {
    const { amount } = req.body;
    const transactionId = `TXN-${Date.now()}`;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'กรุณากรอกจำนวนเงินที่ถูกต้อง' });
    }

    const payload = generatePromptPayPayload(PROMPTPAY_ID, ID_TYPE, amount);
    const qrCode = await qrcode.toDataURL(payload);

    // บันทึก transaction ใน memory (ในระบบจริงควรใช้ database)
    paymentsDB.set(transactionId, {
      amount,
      status: 'PENDING',
      createdAt: new Date(),
      qrCode
    });

    res.json({ 
      qrCode,
      transactionId,
      payload
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้าง QR Code' });
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

    // ในระบบจริงควรเรียก API ธนาคารที่นี่
    const status = await checkPaymentStatus(transactionId);
    
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

// Webhook สำหรับรับการแจ้งเตือนจากธนาคาร (ตัวอย่าง)
app.post('/payment-webhook', async (req, res) => {
  try {
    // ในระบบจริงควรมีการตรวจสอบ signature จากธนาคาร
    const { transactionId, status, amount } = req.body;

    if (paymentsDB.has(transactionId)) {
      const transaction = paymentsDB.get(transactionId);
      transaction.status = status;
      paymentsDB.set(transactionId, transaction);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('ERROR');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});