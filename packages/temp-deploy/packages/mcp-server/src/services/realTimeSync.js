const { getClient } = require('./supabaseClient');

class RealTimeSyncService {
  constructor() {
    this.supabase = getClient();
    this.subscriptions = new Map();
    this.syncQueue = [];
    this.isProcessing = false;
  }

  async syncUserData(walletAddress, userData) {
    if (!this.supabase) {
      console.log('Supabase not configured, using fallback storage');
      return this.fallbackSync(walletAddress, userData);
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .upsert({
          wallet_address: walletAddress.toLowerCase(),
          display_name: userData.displayName,
          email: userData.email,
          role: userData.role || 'user',
          is_verified: userData.isVerified || false,
          last_active: new Date(),
          updated_at: new Date()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('User sync failed:', error);
      return this.fallbackSync(walletAddress, userData);
    }
  }

  async syncBeatData(beatData) {
    if (!this.supabase) {
      return this.fallbackBeatSync(beatData);
    }

    try {
      const { data, error } = await this.supabase
        .from('beats')
        .upsert({
          id: beatData.id,
          title: beatData.title,
          artist: beatData.artist,
          producer_address: beatData.producerId.toLowerCase(),
          description: beatData.description,
          genre: beatData.genre,
          bpm: beatData.bpm,
          duration: beatData.duration,
          price: beatData.price,
          audio_cid: beatData.audioCid,
          artwork_cid: beatData.artworkCid,
          metadata_cid: beatData.metadataCid,
          livepeer_asset_id: beatData.livepeerAssetId,
          playback_url: beatData.playbackUrl,
          status: beatData.status || 'processing',
          moderation_status: beatData.moderationStatus || 'pending',
          is_active: beatData.isActive !== false,
          play_count: beatData.playCount || 0,
          updated_at: new Date()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Beat sync failed:', error);
      return this.fallbackBeatSync(beatData);
    }
  }

  async trackBeatPlay(beatId, userAddress, playData = {}) {
    if (!this.supabase) {
      return this.fallbackPlayTracking(beatId, userAddress, playData);
    }

    try {
      // Insert play record
      const { error: playError } = await this.supabase
        .from('beat_plays')
        .insert({
          beat_id: beatId,
          user_address: userAddress?.toLowerCase(),
          source: playData.source || 'web',
          duration_played: playData.duration || 0,
          completed: playData.completed || false,
          created_at: new Date()
        });

      if (playError) throw playError;

      // Increment play count
      const { error: incrementError } = await this.supabase
        .rpc('increment_beat_plays', { beat_id: beatId });

      if (incrementError) throw incrementError;

      return { success: true };
    } catch (error) {
      console.error('Play tracking failed:', error);
      return this.fallbackPlayTracking(beatId, userAddress, playData);
    }
  }

  subscribeToChanges(table, callback) {
    if (!this.supabase) {
      console.log('Real-time subscriptions not available without Supabase');
      return null;
    }

    const channelName = `${table}-changes-${Date.now()}`;
    
    const subscription = this.supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table 
      }, (payload) => {
        console.log(`Real-time change in ${table}:`, payload);
        callback(payload);
      })
      .subscribe();

    this.subscriptions.set(channelName, subscription);
    return channelName;
  }

  unsubscribe(channelName) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  async createSession(walletAddress, sessionData) {
    if (!this.supabase) {
      return this.fallbackSession(walletAddress, sessionData);
    }

    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { data, error } = await this.supabase
        .from('user_sessions')
        .insert({
          user_address: walletAddress.toLowerCase(),
          session_token: sessionToken,
          device_type: sessionData.deviceType || 'web',
          expires_at: expiresAt,
          created_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, sessionToken, expiresAt };
    } catch (error) {
      console.error('Session creation failed:', error);
      return this.fallbackSession(walletAddress, sessionData);
    }
  }

  async validateSession(sessionToken) {
    if (!this.supabase) {
      return this.fallbackValidateSession(sessionToken);
    }

    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date())
        .single();

      if (error) throw error;

      // Update last used
      await this.supabase
        .from('user_sessions')
        .update({ last_used: new Date() })
        .eq('session_token', sessionToken);

      return { valid: true, userAddress: data.user_address };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Fallback methods for when Supabase is not available
  fallbackSync(walletAddress, userData) {
    const key = `user_profile_${walletAddress.toLowerCase()}`;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    const updated = { ...existing, ...userData, lastSync: new Date() };
    localStorage.setItem(key, JSON.stringify(updated));
    return { success: true, data: updated, fallback: true };
  }

  fallbackBeatSync(beatData) {
    const key = `beat_${beatData.id}`;
    const updated = { ...beatData, lastSync: new Date() };
    localStorage.setItem(key, JSON.stringify(updated));
    return { success: true, data: updated, fallback: true };
  }

  fallbackPlayTracking(beatId, userAddress, playData) {
    const plays = JSON.parse(localStorage.getItem('beat_plays') || '[]');
    plays.push({
      beatId,
      userAddress,
      ...playData,
      timestamp: new Date()
    });
    localStorage.setItem('beat_plays', JSON.stringify(plays.slice(-1000))); // Keep last 1000
    return { success: true, fallback: true };
  }

  fallbackSession(walletAddress, sessionData) {
    const sessionToken = this.generateSessionToken();
    const session = {
      userAddress: walletAddress,
      sessionToken,
      deviceType: sessionData.deviceType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };
    localStorage.setItem(`session_${sessionToken}`, JSON.stringify(session));
    return { success: true, sessionToken, fallback: true };
  }

  fallbackValidateSession(sessionToken) {
    const session = JSON.parse(localStorage.getItem(`session_${sessionToken}`) || 'null');
    if (!session || new Date(session.expiresAt) < new Date()) {
      return { valid: false, error: 'Session expired or not found' };
    }
    return { valid: true, userAddress: session.userAddress, fallback: true };
  }

  generateSessionToken() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async cleanup() {
    // Unsubscribe from all real-time subscriptions
    for (const [channelName, subscription] of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }
}

module.exports = new RealTimeSyncService();