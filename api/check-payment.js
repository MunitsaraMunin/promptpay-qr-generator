const paymentsDB = new Map();

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { transactionId } = req.query;
      const transaction = paymentsDB.get(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'ไม่พบรายการนี้' });
      }

      const status = Math.random() > 0.7 ? 'SUCCESS' : 'PENDING';
      transaction.status = status;
      paymentsDB.set(transactionId, transaction);

      res.status(200).json({
        status,
        amount: transaction.amount,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error checking payment:', error);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
