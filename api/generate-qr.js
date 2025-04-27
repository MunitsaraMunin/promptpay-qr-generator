import qrcode from 'qrcode';

const paymentsDB = new Map();

const PROMPTPAY_ID = '0826464321';
const ID_TYPE = 'PHONE';

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

function generatePromptPayPayload(id, idType, amount) {
  const recipientType = idType === 'PHONE'
    ? `01130066${id.substring(1)}`
    : `0213${id}`;

  const merchantInfo = [
    '0016',
    'A000000677010111',
    recipientType
  ].join('');

  const transactionInfo = [
    '5303764',
    amount ? '54' + amount.toFixed(2).length.toString().padStart(2, '0') + amount.toFixed(2) : '',
    '5802TH',
    '6304'
  ].join('');

  const payloadWithoutCRC = [
    '000201',
    '010211',
    '29' + merchantInfo.length.toString().padStart(2, '0') + merchantInfo,
    transactionInfo
  ].join('');

  const crc = calculateCRC16(payloadWithoutCRC);
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  return payloadWithoutCRC + crcHex;
}

// paymentsDB ต้องแยก storage จริงใน production
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount } = req.body;
      const transactionId = `TXN-${Date.now()}`;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'กรุณากรอกจำนวนเงินที่ถูกต้อง' });
      }

      const payload = generatePromptPayPayload(PROMPTPAY_ID, ID_TYPE, parseFloat(amount));

      const qrCode = await qrcode.toDataURL(payload, {
        errorCorrectionLevel: 'H',
        margin: 1
      });

      paymentsDB.set(transactionId, {
        amount,
        status: 'PENDING',
        createdAt: new Date(),
        qrCode,
        payload
      });

      res.status(200).json({
        qrCode,
        transactionId
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้าง QR Code', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
