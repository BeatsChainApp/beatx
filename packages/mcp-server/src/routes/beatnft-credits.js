const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Get user credit balance
router.get('/balance/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params
    
    const { data, error } = await supabase
      .from('beatnft_credit_balances')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    // Create balance if doesn't exist
    if (!data) {
      const { data: newBalance, error: createError } = await supabase
        .from('beatnft_credit_balances')
        .insert({
          user_address: userAddress.toLowerCase(),
          credits: 10,
          has_pro_nft: false,
          total_used: 0,
          total_purchased: 0
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      return res.json({
        success: true,
        balance: newBalance
      })
    }
    
    res.json({
      success: true,
      balance: data
    })
    
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Purchase credits
router.post('/purchase', async (req, res) => {
  try {
    const { userAddress, credits, transactionHash, packageId } = req.body
    
    // Validate transaction (in production, verify on blockchain)
    const isValidTransaction = await validateTransaction(transactionHash, userAddress, credits)
    
    if (!isValidTransaction) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction'
      })
    }
    
    // Update balance
    const { data: currentBalance } = await supabase
      .from('beatnft_credit_balances')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .single()
    
    const newCredits = (currentBalance?.credits || 10) + credits
    const newTotalPurchased = (currentBalance?.total_purchased || 0) + credits
    
    const { error: updateError } = await supabase
      .from('beatnft_credit_balances')
      .upsert({
        user_address: userAddress.toLowerCase(),
        credits: newCredits,
        total_purchased: newTotalPurchased,
        updated_at: new Date().toISOString()
      })
    
    if (updateError) throw updateError
    
    // Log transaction
    const { error: logError } = await supabase
      .from('beatnft_credit_transactions')
      .insert({
        user_address: userAddress.toLowerCase(),
        transaction_type: 'purchase',
        credits_amount: credits,
        transaction_hash: transactionHash,
        status: 'completed'
      })
    
    if (logError) throw logError
    
    // Update system stats
    await updateSystemStats('purchase', credits)
    
    res.json({
      success: true,
      newBalance: newCredits,
      transactionId: transactionHash
    })
    
  } catch (error) {
    console.error('Error processing credit purchase:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Use credits for upload
router.post('/use', async (req, res) => {
  try {
    const { userAddress, credits, beatId, fileSize } = req.body
    
    const { data: balance } = await supabase
      .from('beatnft_credit_balances')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .single()
    
    if (!balance) {
      return res.status(404).json({
        success: false,
        error: 'User balance not found'
      })
    }
    
    // Check if Pro NFT holder (unlimited uploads)
    if (balance.has_pro_nft) {
      return res.json({
        success: true,
        remainingCredits: 'unlimited',
        message: 'Pro NFT holder - unlimited uploads'
      })
    }
    
    // Check sufficient credits
    if (balance.credits < credits) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        required: credits,
        available: balance.credits
      })
    }
    
    const newCredits = balance.credits - credits
    const newTotalUsed = balance.total_used + credits
    
    // Update balance
    const { error: updateError } = await supabase
      .from('beatnft_credit_balances')
      .update({
        credits: newCredits,
        total_used: newTotalUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_address', userAddress.toLowerCase())
    
    if (updateError) throw updateError
    
    // Log usage
    const { error: logError } = await supabase
      .from('beatnft_credit_transactions')
      .insert({
        user_address: userAddress.toLowerCase(),
        transaction_type: 'usage',
        credits_amount: credits,
        beat_id: beatId,
        file_size_mb: fileSize,
        status: 'completed'
      })
    
    if (logError) throw logError
    
    // Update system stats
    await updateSystemStats('usage', credits)
    
    res.json({
      success: true,
      remainingCredits: newCredits,
      creditsUsed: credits
    })
    
  } catch (error) {
    console.error('Error using credits:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Admin grant credits
router.post('/grant', async (req, res) => {
  try {
    const { targetAddress, credits, grantedBy, reason } = req.body
    
    // Verify admin role (implement proper auth)
    const isAdmin = await verifyAdminRole(grantedBy)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized - admin role required'
      })
    }
    
    const { data: balance } = await supabase
      .from('beatnft_credit_balances')
      .select('*')
      .eq('user_address', targetAddress.toLowerCase())
      .single()
    
    const currentCredits = balance?.credits || 10
    const newCredits = currentCredits + credits
    
    // Update balance
    const { error: updateError } = await supabase
      .from('beatnft_credit_balances')
      .upsert({
        user_address: targetAddress.toLowerCase(),
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
    
    if (updateError) throw updateError
    
    // Log grant
    const { error: logError } = await supabase
      .from('beatnft_credit_transactions')
      .insert({
        user_address: targetAddress.toLowerCase(),
        transaction_type: 'grant',
        credits_amount: credits,
        granted_by: grantedBy,
        reason: reason || 'Admin grant',
        status: 'completed'
      })
    
    if (logError) throw logError
    
    res.json({
      success: true,
      newBalance: newCredits,
      creditsGranted: credits
    })
    
  } catch (error) {
    console.error('Error granting credits:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Pro NFT upgrade
router.post('/pro-upgrade', async (req, res) => {
  try {
    const { userAddress, transactionHash } = req.body
    
    // Validate Pro NFT purchase transaction
    const isValidUpgrade = await validateProNFTTransaction(transactionHash, userAddress)
    
    if (!isValidUpgrade) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Pro NFT transaction'
      })
    }
    
    // Update to Pro NFT status
    const { error: updateError } = await supabase
      .from('beatnft_credit_balances')
      .upsert({
        user_address: userAddress.toLowerCase(),
        has_pro_nft: true,
        pro_nft_upgraded_at: new Date().toISOString(),
        pro_nft_transaction_hash: transactionHash,
        updated_at: new Date().toISOString()
      })
    
    if (updateError) throw updateError
    
    // Log Pro NFT upgrade
    const { error: logError } = await supabase
      .from('beatnft_credit_transactions')
      .insert({
        user_address: userAddress.toLowerCase(),
        transaction_type: 'pro_upgrade',
        credits_amount: 0,
        transaction_hash: transactionHash,
        status: 'completed'
      })
    
    if (logError) throw logError
    
    // Update system stats
    await updateSystemStats('pro_upgrade', 0)
    
    res.json({
      success: true,
      message: 'Successfully upgraded to Pro NFT',
      unlimitedUploads: true
    })
    
  } catch (error) {
    console.error('Error processing Pro NFT upgrade:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const { data: stats } = await supabase
      .from('beatnft_system_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const { data: balances } = await supabase
      .from('beatnft_credit_balances')
      .select('credits, has_pro_nft, total_used, total_purchased')
    
    const aggregatedStats = {
      totalCreditsIssued: balances?.reduce((sum, b) => sum + (b.total_purchased || 0), 0) || 0,
      totalCreditsUsed: balances?.reduce((sum, b) => sum + (b.total_used || 0), 0) || 0,
      activeUsers: balances?.length || 0,
      proBeatNFTHolders: balances?.filter(b => b.has_pro_nft).length || 0,
      averageCreditsPerUser: balances?.length ? 
        Math.round(balances.reduce((sum, b) => sum + (b.credits || 0), 0) / balances.length) : 0
    }
    
    res.json({
      success: true,
      stats: aggregatedStats,
      lastUpdated: stats?.created_at || new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching system stats:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Helper functions
async function validateTransaction(transactionHash, userAddress, credits) {
  // In production: verify transaction on blockchain
  // For now, return true for demo purposes
  return true
}

async function validateProNFTTransaction(transactionHash, userAddress) {
  // In production: verify Pro NFT purchase on blockchain
  return true
}

async function verifyAdminRole(userAddress) {
  // In production: check user role from auth system
  return true
}

async function updateSystemStats(operation, credits) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existingStats } = await supabase
      .from('beatnft_system_stats')
      .select('*')
      .eq('stat_date', today)
      .single()
    
    if (existingStats) {
      const updates = {}
      
      if (operation === 'purchase') {
        updates.total_credits_issued = existingStats.total_credits_issued + credits
      } else if (operation === 'usage') {
        updates.total_credits_used = existingStats.total_credits_used + credits
      } else if (operation === 'pro_upgrade') {
        updates.pro_nft_holders = existingStats.pro_nft_holders + 1
      }
      
      await supabase
        .from('beatnft_system_stats')
        .update(updates)
        .eq('id', existingStats.id)
    } else {
      const newStats = {
        stat_date: today,
        total_credits_issued: operation === 'purchase' ? credits : 0,
        total_credits_used: operation === 'usage' ? credits : 0,
        pro_nft_holders: operation === 'pro_upgrade' ? 1 : 0,
        active_users: 1
      }
      
      await supabase
        .from('beatnft_system_stats')
        .insert(newStats)
    }
  } catch (error) {
    console.error('Error updating system stats:', error)
  }
}

module.exports = router