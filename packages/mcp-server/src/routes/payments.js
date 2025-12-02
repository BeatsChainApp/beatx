const express = require('express');
const { getClient } = require('../services/supabaseClient');
const router = express.Router();

// POST /api/payments - Process payment
router.post('/payments', async (req, res) => {
  try {
    const supabase = getClient();
    const { beatId, licenseType, paymentMethod, amount, buyerAddress } = req.body;
    
    if (!supabase) {
      const mockTransaction = {
        id: `mock_${Date.now()}`,
        beatId, licenseType, amount, paymentMethod,
        status: 'completed',
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };
      return res.json({ success: true, transaction: mockTransaction, mock: true });
    }

    // Get beat data
    const { data: beat } = await supabase.from('beats').select('*').eq('id', beatId).single();
    if (!beat) throw new Error('Beat not found');

    // Create transaction
    const transaction = {
      beat_id: beatId,
      buyer_address: buyerAddress,
      producer_address: beat.producer_address,
      amount: parseFloat(amount),
      license_type: licenseType,
      payment_method: paymentMethod,
      status: 'completed',
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
    if (error) throw error;

    // Create purchase record
    await supabase.from('purchases').insert({
      transaction_id: data.id,
      beat_id: beatId,
      buyer_address: buyerAddress,
      license_type: licenseType,
      download_url: beat.audio_url,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, transaction: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/payments/:address - Get user transactions
router.get('/payments/:address', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, transactions: [], mock: true });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, beats(title, producer_name)')
      .eq('buyer_address', req.params.address)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, transactions: data || [] });
  } catch (error) {
    res.json({ success: true, transactions: [], error: error.message });
  }
});

module.exports = router;