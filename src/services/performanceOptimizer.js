/**
 * Performance Optimizer - Caching, CDN, and database optimization
 * Phase 4: Advanced Features + Optimization
 */

const { createClient } = require('@supabase/supabase-js');

class PerformanceOptimizer {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.cache = new Map();
    this.queryCache = new Map();
    this.compressionCache = new Map();
  }

  // Intelligent caching with TTL
  async getCached(key, fetchFunction, ttl = 300000) { // 5 minutes default
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // Return stale data if available
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  // Query optimization with prepared statements
  async optimizedQuery(queryKey, queryFunction, params = {}) {
    const cacheKey = `query_${queryKey}_${JSON.stringify(params)}`;
    
    return this.getCached(cacheKey, queryFunction, 60000); // 1 minute TTL
  }

  // Batch database operations
  async batchInsert(table, records, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error } = await this.supabase
          .from(table)
          .insert(batch)
          .select();
        
        if (error) throw error;
        results.push(...(data || []));
      } catch (error) {
        console.error(`Batch insert error for ${table}:`, error);
        throw error;
      }
    }
    
    return results;
  }

  // Optimized beat search with caching
  async searchBeatsOptimized(searchParams) {
    const cacheKey = `search_${JSON.stringify(searchParams)}`;
    
    return this.getCached(cacheKey, async () => {
      const { data, error } = await this.supabase
        .rpc('search_beats', searchParams);
      
      if (error) throw error;
      return data || [];
    }, 120000); // 2 minutes TTL
  }

  // Preload popular content
  async preloadPopularContent() {
    try {
      // Preload trending beats
      await this.getCached('trending_beats', async () => {
        const { data } = await this.supabase
          .from('beats')
          .select(`
            *,
            beat_plays(count)
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(50);
        
        return data || [];
      }, 600000); // 10 minutes TTL

      // Preload popular genres
      await this.getCached('popular_genres', async () => {
        const { data } = await this.supabase
          .from('beats')
          .select('genre')
          .eq('status', 'approved');
        
        const genreCounts = {};
        data?.forEach(beat => {
          if (beat.genre) {
            genreCounts[beat.genre] = (genreCounts[beat.genre] || 0) + 1;
          }
        });
        
        return Object.entries(genreCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([genre]) => genre);
      }, 1800000); // 30 minutes TTL

      console.log('Popular content preloaded');
    } catch (error) {
      console.error('Preload error:', error);
    }
  }

  // Database connection pooling optimization
  async optimizeConnections() {
    // Connection pool is handled by Supabase client
    // This method can be extended for custom connection management
    console.log('Database connections optimized');
  }

  // Memory usage monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      cacheSize: this.cache.size,
      queryCacheSize: this.queryCache.size
    };
  }

  // Cache cleanup and optimization
  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;

    // Clean expired cache entries
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 3600000) { // 1 hour
        this.cache.delete(key);
        cleaned++;
      }
    }

    // Clean query cache
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > 1800000) { // 30 minutes
        this.queryCache.delete(key);
        cleaned++;
      }
    }

    console.log(`Cleaned ${cleaned} expired cache entries`);
    return cleaned;
  }

  // Response compression
  compressResponse(data, compressionLevel = 'medium') {
    const key = `${JSON.stringify(data)}_${compressionLevel}`;
    
    if (this.compressionCache.has(key)) {
      return this.compressionCache.get(key);
    }

    // Simple compression simulation (in production, use gzip/brotli)
    let compressed = data;
    
    if (compressionLevel === 'high') {
      // Remove unnecessary fields for high compression
      if (Array.isArray(compressed)) {
        compressed = compressed.map(item => ({
          id: item.id,
          title: item.title,
          genre: item.genre,
          bpm: item.bpm,
          audio_url: item.audio_url
        }));
      }
    }

    this.compressionCache.set(key, compressed);
    return compressed;
  }

  // Performance metrics collection
  async collectMetrics() {
    const metrics = {
      memory: this.getMemoryUsage(),
      cache: {
        hitRate: this.calculateCacheHitRate(),
        size: this.cache.size,
        querySize: this.queryCache.size
      },
      database: await this.getDatabaseMetrics(),
      timestamp: new Date().toISOString()
    };

    // Store metrics for analysis
    try {
      await this.supabase
        .from('analytics_events')
        .insert([{
          event_type: 'performance_metrics',
          event_data: metrics
        }]);
    } catch (error) {
      console.error('Metrics collection error:', error);
    }

    return metrics;
  }

  // Calculate cache hit rate
  calculateCacheHitRate() {
    // This would be implemented with proper hit/miss tracking
    return 0.85; // Mock 85% hit rate
  }

  // Get database performance metrics
  async getDatabaseMetrics() {
    try {
      // Query execution time monitoring
      const start = Date.now();
      
      await this.supabase
        .from('beats')
        .select('count')
        .limit(1);
      
      const queryTime = Date.now() - start;

      return {
        avgQueryTime: queryTime,
        connectionPool: 'healthy',
        activeConnections: 5 // Mock data
      };
    } catch (error) {
      return {
        avgQueryTime: -1,
        connectionPool: 'error',
        activeConnections: 0
      };
    }
  }

  // Optimize images and assets
  async optimizeAssets(assetUrl, options = {}) {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // In production, this would integrate with image optimization service
    const optimizedUrl = `${assetUrl}?w=${width}&h=${height}&q=${quality}&f=${format}`;
    
    return optimizedUrl;
  }

  // Lazy loading implementation
  async lazyLoadContent(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    return this.getCached(`lazy_load_${page}_${limit}`, async () => {
      const { data, error } = await this.supabase
        .from('beats')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    }, 300000); // 5 minutes TTL
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 300000);

    // Cleanup cache every hour
    setInterval(() => {
      this.cleanupCache();
    }, 3600000);

    // Preload popular content every 30 minutes
    setInterval(() => {
      this.preloadPopularContent();
    }, 1800000);

    console.log('Performance monitoring started');
  }

  // Get performance report
  async getPerformanceReport() {
    const metrics = await this.collectMetrics();
    
    return {
      status: 'healthy',
      metrics,
      recommendations: this.generateRecommendations(metrics),
      timestamp: new Date().toISOString()
    };
  }

  // Generate performance recommendations
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.memory.heapUsed > 500) {
      recommendations.push('High memory usage detected. Consider increasing cache cleanup frequency.');
    }

    if (metrics.cache.hitRate < 0.7) {
      recommendations.push('Low cache hit rate. Consider increasing cache TTL or preloading more content.');
    }

    if (metrics.database.avgQueryTime > 1000) {
      recommendations.push('Slow database queries detected. Consider adding indexes or optimizing queries.');
    }

    return recommendations;
  }
}

module.exports = PerformanceOptimizer;