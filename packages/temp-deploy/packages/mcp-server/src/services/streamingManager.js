/**
 * Streaming Manager - Complete Livepeer TUS integration
 * Phase 3: Content Management + Streaming
 */

const { createClient } = require('@supabase/supabase-js');
const LivepeerAdapter = require('./livepeerAdapter');

class StreamingManager {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.livepeer = new LivepeerAdapter();
    this.uploadQueue = new Map();
  }

  // Initialize TUS upload
  async initializeUpload(userId, fileInfo) {
    try {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create TUS upload session
      const tusUpload = await this.livepeer.createTUSUpload({
        name: fileInfo.name,
        size: fileInfo.size,
        metadata: {
          userId,
          uploadId,
          originalName: fileInfo.name
        }
      });

      // Store upload session
      const uploadSession = {
        id: uploadId,
        userId,
        tusUploadId: tusUpload.id,
        tusUploadUrl: tusUpload.tusEndpoint,
        status: 'initialized',
        fileInfo,
        progress: 0,
        createdAt: new Date().toISOString()
      };

      this.uploadQueue.set(uploadId, uploadSession);

      // Store in database
      await this.supabase
        .from('upload_sessions')
        .insert([uploadSession]);

      return {
        uploadId,
        tusUploadUrl: tusUpload.tusEndpoint,
        chunkSize: 1024 * 1024 * 5 // 5MB chunks
      };
    } catch (error) {
      console.error('Initialize upload error:', error);
      throw error;
    }
  }

  // Handle upload progress
  async updateUploadProgress(uploadId, progress, bytesUploaded) {
    try {
      const session = this.uploadQueue.get(uploadId);
      if (!session) {
        throw new Error('Upload session not found');
      }

      session.progress = progress;
      session.bytesUploaded = bytesUploaded;
      session.updatedAt = new Date().toISOString();

      // Update database
      await this.supabase
        .from('upload_sessions')
        .update({
          progress,
          bytes_uploaded: bytesUploaded,
          updated_at: session.updatedAt
        })
        .eq('id', uploadId);

      return { success: true, progress };
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  // Complete upload and start processing
  async completeUpload(uploadId) {
    try {
      const session = this.uploadQueue.get(uploadId);
      if (!session) {
        throw new Error('Upload session not found');
      }

      // Finalize TUS upload
      const asset = await this.livepeer.finalizeTUSUpload(session.tusUploadId);

      // Update session
      session.status = 'processing';
      session.assetId = asset.id;
      session.completedAt = new Date().toISOString();

      // Update database
      await this.supabase
        .from('upload_sessions')
        .update({
          status: 'processing',
          asset_id: asset.id,
          completed_at: session.completedAt
        })
        .eq('id', uploadId);

      // Start monitoring processing
      this.monitorProcessing(uploadId, asset.id);

      return {
        uploadId,
        assetId: asset.id,
        status: 'processing'
      };
    } catch (error) {
      console.error('Complete upload error:', error);
      throw error;
    }
  }

  // Monitor asset processing
  async monitorProcessing(uploadId, assetId) {
    const checkInterval = setInterval(async () => {
      try {
        const asset = await this.livepeer.getAsset(assetId);
        
        if (asset.status.phase === 'ready') {
          clearInterval(checkInterval);
          await this.finalizeAsset(uploadId, asset);
        } else if (asset.status.phase === 'failed') {
          clearInterval(checkInterval);
          await this.handleProcessingError(uploadId, asset.status.errorMessage);
        }
      } catch (error) {
        console.error('Monitor processing error:', error);
      }
    }, 5000); // Check every 5 seconds

    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  }

  // Finalize processed asset
  async finalizeAsset(uploadId, asset) {
    try {
      const session = this.uploadQueue.get(uploadId);
      if (!session) return;

      // Generate streaming URLs
      const streamingUrls = {
        hls: `https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/${asset.playbackId}/index.m3u8`,
        mp4: asset.downloadUrl
      };

      // Update session
      session.status = 'ready';
      session.streamingUrls = streamingUrls;
      session.processedAt = new Date().toISOString();

      // Update database
      await this.supabase
        .from('upload_sessions')
        .update({
          status: 'ready',
          streaming_urls: streamingUrls,
          processed_at: session.processedAt
        })
        .eq('id', uploadId);

      // Clean up queue
      this.uploadQueue.delete(uploadId);

      console.log(`Asset ${uploadId} ready for streaming`);
    } catch (error) {
      console.error('Finalize asset error:', error);
    }
  }

  // Handle processing errors
  async handleProcessingError(uploadId, errorMessage) {
    try {
      const session = this.uploadQueue.get(uploadId);
      if (!session) return;

      session.status = 'failed';
      session.error = errorMessage;

      await this.supabase
        .from('upload_sessions')
        .update({
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', uploadId);

      this.uploadQueue.delete(uploadId);

      console.error(`Asset ${uploadId} processing failed:`, errorMessage);
    } catch (error) {
      console.error('Handle processing error:', error);
    }
  }

  // Get upload status
  async getUploadStatus(uploadId) {
    try {
      const { data, error } = await this.supabase
        .from('upload_sessions')
        .select('*')
        .eq('id', uploadId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get upload status error:', error);
      throw error;
    }
  }

  // Get user uploads
  async getUserUploads(userId, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('upload_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user uploads error:', error);
      throw error;
    }
  }

  // Generate streaming token
  async generateStreamingToken(assetId, userId) {
    try {
      // Verify user has access to asset
      const { data: session } = await this.supabase
        .from('upload_sessions')
        .select('*')
        .eq('asset_id', assetId)
        .eq('user_id', userId)
        .single();

      if (!session) {
        throw new Error('Asset not found or access denied');
      }

      // Generate JWT token for streaming
      const token = await this.livepeer.generatePlaybackToken(assetId, {
        userId,
        expiresIn: '24h'
      });

      return { token, playbackId: session.asset_id };
    } catch (error) {
      console.error('Generate streaming token error:', error);
      throw error;
    }
  }

  // Clean up old uploads
  async cleanupOldUploads() {
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data: oldUploads } = await this.supabase
        .from('upload_sessions')
        .select('*')
        .lt('created_at', cutoff.toISOString())
        .in('status', ['failed', 'ready']);

      for (const upload of oldUploads || []) {
        try {
          if (upload.asset_id) {
            await this.livepeer.deleteAsset(upload.asset_id);
          }
          
          await this.supabase
            .from('upload_sessions')
            .delete()
            .eq('id', upload.id);
            
        } catch (error) {
          console.error(`Cleanup error for upload ${upload.id}:`, error);
        }
      }

      console.log(`Cleaned up ${oldUploads?.length || 0} old uploads`);
    } catch (error) {
      console.error('Cleanup old uploads error:', error);
    }
  }
}

module.exports = StreamingManager;