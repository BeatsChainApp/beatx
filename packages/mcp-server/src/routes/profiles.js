const express = require('express');
const { getClient } = require('../services/supabaseClient');
const router = express.Router();

// Sync profile from frontend to Supabase
router.post('/profiles/sync', async (req, res) => {
  try {
    const supabase = getClient();
    const { address, profile } = req.body;
    
    if (!supabase) {
      return res.json({ success: true, mock: true });
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        wallet_address: address.toLowerCase(),
        display_name: profile.displayName,
        email: profile.email,
        role: profile.role,
        profile_image: profile.profileImage,
        bio: profile.bio,
        is_verified: profile.isVerified,
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true, error: error.message });
  }
});

module.exports = router;