/**
 * Content Moderator - AI-powered content review and moderation
 * Phase 3: Content Management + Streaming
 */

const { createClient } = require('@supabase/supabase-js');

class ContentModerator {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.moderationQueue = [];
    this.processing = false;
  }

  // Auto-moderate uploaded content
  async moderateContent(contentId, contentType, contentData) {
    try {
      const moderationResult = {
        contentId,
        contentType,
        status: 'pending',
        scores: {},
        flags: [],
        autoApproved: false,
        needsReview: false
      };

      // Basic content checks
      const checks = await Promise.all([
        this.checkTextContent(contentData.title, contentData.description),
        this.checkAudioContent(contentData.audioUrl),
        this.checkMetadata(contentData)
      ]);

      moderationResult.scores = {
        text: checks[0].score,
        audio: checks[1].score,
        metadata: checks[2].score,
        overall: (checks[0].score + checks[1].score + checks[2].score) / 3
      };

      moderationResult.flags = [
        ...checks[0].flags,
        ...checks[1].flags,
        ...checks[2].flags
      ];

      // Auto-approval logic
      if (moderationResult.scores.overall >= 0.8 && moderationResult.flags.length === 0) {
        moderationResult.status = 'approved';
        moderationResult.autoApproved = true;
      } else if (moderationResult.scores.overall < 0.3 || moderationResult.flags.some(f => f.severity === 'high')) {
        moderationResult.status = 'rejected';
      } else {
        moderationResult.status = 'review_needed';
        moderationResult.needsReview = true;
      }

      // Store moderation result
      await this.storeModerationResult(moderationResult);

      // Update content status
      await this.updateContentStatus(contentId, contentType, moderationResult.status);

      return moderationResult;
    } catch (error) {
      console.error('Content moderation error:', error);
      throw error;
    }
  }

  // Text content analysis
  async checkTextContent(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const flags = [];
    let score = 1.0;

    // Profanity check
    const profanityWords = ['spam', 'fake', 'scam', 'illegal'];
    const foundProfanity = profanityWords.filter(word => text.includes(word));
    if (foundProfanity.length > 0) {
      flags.push({ type: 'profanity', severity: 'medium', words: foundProfanity });
      score -= 0.3;
    }

    // Length check
    if (title.length < 3 || title.length > 100) {
      flags.push({ type: 'title_length', severity: 'low' });
      score -= 0.1;
    }

    // Quality indicators
    if (text.includes('high quality') || text.includes('professional')) {
      score += 0.1;
    }

    return { score: Math.max(0, Math.min(1, score)), flags };
  }

  // Audio content analysis
  async checkAudioContent(audioUrl) {
    const flags = [];
    let score = 0.8; // Default score for audio

    try {
      // Basic audio validation
      if (!audioUrl || !audioUrl.includes('http')) {
        flags.push({ type: 'invalid_audio_url', severity: 'high' });
        score = 0.2;
      }

      // File format check
      const validFormats = ['.mp3', '.wav', '.m4a', '.aac'];
      const hasValidFormat = validFormats.some(format => audioUrl.includes(format));
      if (!hasValidFormat) {
        flags.push({ type: 'unsupported_format', severity: 'medium' });
        score -= 0.2;
      }

      return { score: Math.max(0, Math.min(1, score)), flags };
    } catch (error) {
      return { score: 0.5, flags: [{ type: 'audio_check_error', severity: 'low' }] };
    }
  }

  // Metadata validation
  async checkMetadata(metadata) {
    const flags = [];
    let score = 1.0;

    // Required fields check
    const requiredFields = ['title', 'genre', 'bpm'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    if (missingFields.length > 0) {
      flags.push({ type: 'missing_metadata', severity: 'medium', fields: missingFields });
      score -= 0.2 * missingFields.length;
    }

    // BPM validation
    if (metadata.bpm && (metadata.bpm < 60 || metadata.bpm > 200)) {
      flags.push({ type: 'invalid_bpm', severity: 'low' });
      score -= 0.1;
    }

    // Genre validation
    const validGenres = ['hip-hop', 'trap', 'amapiano', 'afrobeat', 'house', 'techno', 'other'];
    if (metadata.genre && !validGenres.includes(metadata.genre.toLowerCase())) {
      flags.push({ type: 'invalid_genre', severity: 'low' });
      score -= 0.1;
    }

    return { score: Math.max(0, Math.min(1, score)), flags };
  }

  // Store moderation result
  async storeModerationResult(result) {
    const { error } = await this.supabase
      .from('moderation_actions')
      .insert([{
        content_id: result.contentId,
        content_type: result.contentType,
        action: result.status,
        reason: result.flags.length > 0 ? JSON.stringify(result.flags) : null,
        scores: result.scores,
        auto_approved: result.autoApproved,
        moderator_id: null, // System moderation
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  }

  // Update content status
  async updateContentStatus(contentId, contentType, status) {
    const table = contentType === 'beat' ? 'beats' : 'content';
    
    const { error } = await this.supabase
      .from(table)
      .update({ 
        status: status,
        moderated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (error) throw error;
  }

  // Get pending reviews
  async getPendingReviews(limit = 20) {
    const { data, error } = await this.supabase
      .from('beats')
      .select(`
        *,
        moderation_actions(*)
      `)
      .eq('status', 'review_needed')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Manual review action
  async reviewContent(contentId, action, reason, moderatorId) {
    try {
      // Update content status
      await this.updateContentStatus(contentId, 'beat', action);

      // Record moderation action
      const { error } = await this.supabase
        .from('moderation_actions')
        .insert([{
          content_id: contentId,
          content_type: 'beat',
          action: action,
          reason: reason,
          moderator_id: moderatorId,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      return { success: true, action, contentId };
    } catch (error) {
      console.error('Manual review error:', error);
      throw error;
    }
  }

  // Bulk moderation
  async bulkModerate(contentIds, action, reason, moderatorId) {
    const results = [];
    
    for (const contentId of contentIds) {
      try {
        const result = await this.reviewContent(contentId, action, reason, moderatorId);
        results.push(result);
      } catch (error) {
        results.push({ success: false, error: error.message, contentId });
      }
    }

    return results;
  }

  // Moderation statistics
  async getModerationStats(timeRange = '7d') {
    const timeFilter = new Date(Date.now() - (timeRange === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .rpc('get_moderation_stats', {
        time_filter: timeFilter.toISOString()
      });

    if (error) throw error;

    return data?.[0] || {
      total_reviewed: 0,
      auto_approved: 0,
      manual_approved: 0,
      rejected: 0,
      pending_review: 0
    };
  }
}

module.exports = ContentModerator;