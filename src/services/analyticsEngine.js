/**
 * Analytics Engine - Real-time metrics and user behavior tracking
 * Provides dashboard analytics, user insights, and performance metrics
 */

const { createClient } = require('@supabase/supabase-js');

class AnalyticsEngine {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn(`AnalyticsEngine: supabaseUrl is required. URL: ${supabaseUrl ? 'SET' : 'MISSING'}, KEY: ${supabaseKey ? 'SET' : 'MISSING'}`);
      this.enabled = false;
      return;
    }
    
    this.enabled = true;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Real-time dashboard metrics
  async getDashboardMetrics(userId, timeRange = '24h') {
    const cacheKey = `dashboard_${userId}_${timeRange}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      // Parallel queries for performance
      const [
        totalBeats,
        totalPlays,
        totalEarnings,
        recentActivity,
        topBeats,
        userGrowth
      ] = await Promise.all([
        this.getTotalBeats(userId, timeFilter),
        this.getTotalPlays(userId, timeFilter),
        this.getTotalEarnings(userId, timeFilter),
        this.getRecentActivity(userId, timeFilter),
        this.getTopBeats(userId, timeFilter),
        this.getUserGrowth(timeFilter)
      ]);

      const metrics = {
        overview: {
          totalBeats: totalBeats.count,
          totalPlays: totalPlays.count,
          totalEarnings: totalEarnings.amount,
          conversionRate: this.calculateConversionRate(totalPlays.count, totalEarnings.transactions)
        },
        activity: recentActivity,
        topPerforming: topBeats,
        growth: userGrowth,
        timestamp: Date.now()
      };

      this.cache.set(cacheKey, { data: metrics, timestamp: Date.now() });
      return metrics;
    } catch (error) {
      console.error('Analytics Engine - Dashboard metrics error:', error);
      throw error;
    }
  }

  // User behavior analytics
  async getUserAnalytics(userId, timeRange = '7d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const [sessions, interactions, preferences] = await Promise.all([
        this.getUserSessions(userId, timeFilter),
        this.getUserInteractions(userId, timeFilter),
        this.getUserPreferences(userId)
      ]);

      return {
        sessions: {
          total: sessions.length,
          avgDuration: this.calculateAvgDuration(sessions),
          devices: this.groupByDevice(sessions)
        },
        interactions: {
          plays: interactions.filter(i => i.type === 'play').length,
          likes: interactions.filter(i => i.type === 'like').length,
          shares: interactions.filter(i => i.type === 'share').length,
          purchases: interactions.filter(i => i.type === 'purchase').length
        },
        preferences: preferences,
        engagement: this.calculateEngagementScore(sessions, interactions)
      };
    } catch (error) {
      console.error('Analytics Engine - User analytics error:', error);
      throw error;
    }
  }

  // Real-time beat performance
  async getBeatAnalytics(beatId, timeRange = '7d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data: plays } = await this.supabase
        .from('beat_plays')
        .select('*')
        .eq('beat_id', beatId)
        .gte('created_at', timeFilter);

      const { data: transactions } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('beat_id', beatId)
        .gte('created_at', timeFilter);

      return {
        plays: {
          total: plays?.length || 0,
          unique: new Set(plays?.map(p => p.user_id)).size || 0,
          timeline: this.groupByTime(plays, timeRange)
        },
        revenue: {
          total: transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
          transactions: transactions?.length || 0,
          avgPrice: transactions?.length ? 
            transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length : 0
        },
        engagement: {
          completionRate: this.calculateCompletionRate(plays),
          repeatListeners: this.calculateRepeatListeners(plays),
          shareRate: this.calculateShareRate(beatId, plays?.length || 0)
        }
      };
    } catch (error) {
      console.error('Analytics Engine - Beat analytics error:', error);
      throw error;
    }
  }

  // Platform-wide analytics (admin only)
  async getPlatformAnalytics(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const [users, beats, transactions, plays] = await Promise.all([
        this.getPlatformUsers(timeFilter),
        this.getPlatformBeats(timeFilter),
        this.getPlatformTransactions(timeFilter),
        this.getPlatformPlays(timeFilter)
      ]);

      return {
        users: {
          total: users.total,
          active: users.active,
          new: users.new,
          retention: users.retention
        },
        content: {
          beats: beats.total,
          approved: beats.approved,
          pending: beats.pending,
          avgQuality: beats.avgQuality
        },
        revenue: {
          total: transactions.total,
          volume: transactions.volume,
          avgTransaction: transactions.avg,
          topEarners: transactions.topEarners
        },
        engagement: {
          totalPlays: plays.total,
          avgSession: plays.avgSession,
          topBeats: plays.topBeats,
          trends: plays.trends
        }
      };
    } catch (error) {
      console.error('Analytics Engine - Platform analytics error:', error);
      throw error;
    }
  }

  // Helper methods
  getTimeFilter(timeRange) {
    const now = new Date();
    const ranges = {
      '1h': new Date(now - 60 * 60 * 1000),
      '24h': new Date(now - 24 * 60 * 60 * 1000),
      '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now - 90 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange] || ranges['24h'];
  }

  async getTotalBeats(userId, timeFilter) {
    const { count } = await this.supabase
      .from('beats')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', userId)
      .gte('created_at', timeFilter.toISOString());
    return { count: count || 0 };
  }

  async getTotalPlays(userId, timeFilter) {
    const { count } = await this.supabase
      .from('beat_plays')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', userId)
      .gte('created_at', timeFilter.toISOString());
    return { count: count || 0 };
  }

  async getTotalEarnings(userId, timeFilter) {
    const { data } = await this.supabase
      .from('transactions')
      .select('amount')
      .eq('producer_id', userId)
      .gte('created_at', timeFilter.toISOString());
    
    const amount = data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    return { amount, transactions: data?.length || 0 };
  }

  async getRecentActivity(userId, timeFilter) {
    const { data } = await this.supabase
      .from('beat_plays')
      .select(`
        *,
        beats(title, genre),
        users(username, avatar_url)
      `)
      .eq('producer_id', userId)
      .gte('created_at', timeFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    return data || [];
  }

  async getTopBeats(userId, timeFilter) {
    const { data } = await this.supabase
      .rpc('get_top_beats_by_plays', {
        producer_id: userId,
        time_filter: timeFilter.toISOString(),
        limit_count: 5
      });
    
    return data || [];
  }

  async getUserGrowth(timeFilter) {
    const { data } = await this.supabase
      .rpc('get_user_growth_stats', {
        time_filter: timeFilter.toISOString()
      });
    
    return data || [];
  }

  calculateConversionRate(plays, transactions) {
    return plays > 0 ? ((transactions / plays) * 100).toFixed(2) : 0;
  }

  calculateAvgDuration(sessions) {
    if (!sessions.length) return 0;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return Math.round(totalDuration / sessions.length);
  }

  groupByDevice(sessions) {
    return sessions.reduce((acc, session) => {
      const device = session.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
  }

  groupByTime(data, timeRange) {
    const intervals = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const groups = Array(intervals).fill(0);
    
    data?.forEach(item => {
      const date = new Date(item.created_at);
      const interval = this.getTimeInterval(date, timeRange);
      if (interval >= 0 && interval < intervals) {
        groups[interval]++;
      }
    });
    
    return groups;
  }

  getTimeInterval(date, timeRange) {
    const now = new Date();
    const diff = now - date;
    
    if (timeRange === '24h') {
      return Math.floor(diff / (60 * 60 * 1000)); // Hours
    } else if (timeRange === '7d') {
      return Math.floor(diff / (24 * 60 * 60 * 1000)); // Days
    } else {
      return Math.floor(diff / (24 * 60 * 60 * 1000)); // Days
    }
  }

  calculateEngagementScore(sessions, interactions) {
    const sessionScore = sessions.length * 10;
    const interactionScore = interactions.length * 5;
    const avgDuration = this.calculateAvgDuration(sessions);
    const durationScore = Math.min(avgDuration / 60, 100); // Max 100 for 1+ hour sessions
    
    return Math.round((sessionScore + interactionScore + durationScore) / 3);
  }

  // Clear cache
  clearCache(pattern) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

module.exports = AnalyticsEngine;