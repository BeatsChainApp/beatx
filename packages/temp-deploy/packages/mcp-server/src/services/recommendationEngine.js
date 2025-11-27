/**
 * Recommendation Engine - AI-powered beat suggestions
 * Phase 4: Advanced Features + Optimization
 */

const { createClient } = require('@supabase/supabase-js');

class RecommendationEngine {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get personalized recommendations for user
  async getPersonalizedRecommendations(userId, limit = 10) {
    const cacheKey = `recommendations_${userId}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Get user listening history
      const userHistory = await this.getUserHistory(userId);
      
      // Get user preferences
      const userPreferences = await this.getUserPreferences(userId);
      
      // Generate recommendations based on multiple factors
      const recommendations = await this.generateRecommendations(
        userId,
        userHistory,
        userPreferences,
        limit
      );

      // Cache results
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });

      return recommendations;
    } catch (error) {
      console.error('Personalized recommendations error:', error);
      return [];
    }
  }

  // Get trending beats
  async getTrendingBeats(timeRange = '24h', limit = 20) {
    const cacheKey = `trending_${timeRange}_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data, error } = await this.supabase
        .rpc('get_trending_beats', {
          time_filter: timeFilter.toISOString(),
          limit_count: limit
        });

      if (error) throw error;

      const trending = data || [];
      
      this.cache.set(cacheKey, {
        data: trending,
        timestamp: Date.now()
      });

      return trending;
    } catch (error) {
      console.error('Trending beats error:', error);
      return [];
    }
  }

  // Get similar beats based on audio features
  async getSimilarBeats(beatId, limit = 10) {
    try {
      // Get target beat features
      const { data: targetBeat } = await this.supabase
        .from('beats')
        .select('*')
        .eq('id', beatId)
        .single();

      if (!targetBeat) return [];

      // Find similar beats using multiple criteria
      const { data: similarBeats } = await this.supabase
        .rpc('find_similar_beats', {
          target_genre: targetBeat.genre,
          target_bpm: targetBeat.bpm,
          target_energy: targetBeat.energy_level,
          exclude_id: beatId,
          limit_count: limit
        });

      return similarBeats || [];
    } catch (error) {
      console.error('Similar beats error:', error);
      return [];
    }
  }

  // Get recommendations by genre
  async getGenreRecommendations(genre, userId = null, limit = 20) {
    try {
      let query = this.supabase
        .from('beats')
        .select(`
          *,
          beat_plays!inner(count)
        `)
        .eq('genre', genre)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Exclude user's own beats if userId provided
      if (userId) {
        query = query.neq('producer_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Sort by popularity (play count)
      return (data || []).sort((a, b) => 
        (b.beat_plays?.length || 0) - (a.beat_plays?.length || 0)
      );
    } catch (error) {
      console.error('Genre recommendations error:', error);
      return [];
    }
  }

  // Get new releases
  async getNewReleases(limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('beats')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('New releases error:', error);
      return [];
    }
  }

  // Get user listening history
  async getUserHistory(userId) {
    try {
      const { data, error } = await this.supabase
        .from('beat_plays')
        .select(`
          *,
          beats(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('User history error:', error);
      return [];
    }
  }

  // Get user preferences from listening patterns
  async getUserPreferences(userId) {
    try {
      const history = await this.getUserHistory(userId);
      
      if (history.length === 0) {
        return {
          genres: [],
          avgBpm: 120,
          avgEnergy: 5,
          preferredMoods: []
        };
      }

      // Analyze listening patterns
      const genres = {};
      const bpms = [];
      const energyLevels = [];
      const moods = {};

      history.forEach(play => {
        const beat = play.beats;
        if (!beat) return;

        // Count genres
        if (beat.genre) {
          genres[beat.genre] = (genres[beat.genre] || 0) + 1;
        }

        // Collect BPMs
        if (beat.bpm) {
          bpms.push(beat.bpm);
        }

        // Collect energy levels
        if (beat.energy_level) {
          energyLevels.push(beat.energy_level);
        }

        // Count moods
        if (beat.mood) {
          moods[beat.mood] = (moods[beat.mood] || 0) + 1;
        }
      });

      return {
        genres: Object.keys(genres).sort((a, b) => genres[b] - genres[a]),
        avgBpm: bpms.length > 0 ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 120,
        avgEnergy: energyLevels.length > 0 ? Math.round(energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length) : 5,
        preferredMoods: Object.keys(moods).sort((a, b) => moods[b] - moods[a])
      };
    } catch (error) {
      console.error('User preferences error:', error);
      return { genres: [], avgBpm: 120, avgEnergy: 5, preferredMoods: [] };
    }
  }

  // Generate recommendations using collaborative filtering
  async generateRecommendations(userId, history, preferences, limit) {
    try {
      const recommendations = [];

      // 1. Genre-based recommendations (40%)
      const genreLimit = Math.ceil(limit * 0.4);
      if (preferences.genres.length > 0) {
        const genreRecs = await this.getGenreRecommendations(
          preferences.genres[0], 
          userId, 
          genreLimit
        );
        recommendations.push(...genreRecs);
      }

      // 2. Similar beats to recently played (30%)
      const similarLimit = Math.ceil(limit * 0.3);
      if (history.length > 0) {
        const recentBeat = history[0].beats;
        if (recentBeat) {
          const similarRecs = await this.getSimilarBeats(recentBeat.id, similarLimit);
          recommendations.push(...similarRecs);
        }
      }

      // 3. Trending beats (20%)
      const trendingLimit = Math.ceil(limit * 0.2);
      const trendingRecs = await this.getTrendingBeats('24h', trendingLimit);
      recommendations.push(...trendingRecs);

      // 4. New releases (10%)
      const newLimit = Math.ceil(limit * 0.1);
      const newRecs = await this.getNewReleases(newLimit);
      recommendations.push(...newRecs);

      // Remove duplicates and user's own beats
      const uniqueRecs = recommendations
        .filter((beat, index, self) => 
          index === self.findIndex(b => b.id === beat.id) &&
          beat.producer_id !== userId
        )
        .slice(0, limit);

      return uniqueRecs;
    } catch (error) {
      console.error('Generate recommendations error:', error);
      return [];
    }
  }

  // Get time filter for trending calculations
  getTimeFilter(timeRange) {
    const now = new Date();
    const ranges = {
      '1h': new Date(now - 60 * 60 * 1000),
      '24h': new Date(now - 24 * 60 * 60 * 1000),
      '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now - 30 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange] || ranges['24h'];
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

  // Track recommendation interaction
  async trackInteraction(userId, beatId, interactionType) {
    try {
      await this.supabase
        .from('analytics_events')
        .insert([{
          user_id: userId,
          event_type: 'recommendation_interaction',
          event_data: {
            beat_id: beatId,
            interaction_type: interactionType
          }
        }]);

      // Clear user's recommendation cache to refresh
      this.clearCache(`recommendations_${userId}`);
    } catch (error) {
      console.error('Track interaction error:', error);
    }
  }
}

module.exports = RecommendationEngine;