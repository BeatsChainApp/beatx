'use client';

import React, { useState, useCallback } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface UploadProgress {
  uploadId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  error?: string;
}

export function AdvancedUploader() {
  const { user } = useUnifiedAuth();
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        await startUpload(file);
      }
    }
  }, []);

  const startUpload = async (file: File) => {
    try {
      // Initialize upload
      const response = await fetch('/api/content/upload/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        })
      });

      if (!response.ok) throw new Error('Failed to initialize upload');

      const { uploadId, tusUploadUrl, chunkSize } = await response.json();

      // Add to uploads map
      setUploads(prev => new Map(prev.set(uploadId, {
        uploadId,
        progress: 0,
        status: 'uploading'
      })));

      // Start TUS upload
      await uploadWithTUS(file, tusUploadUrl, uploadId, chunkSize);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const uploadWithTUS = async (file: File, tusUrl: string, uploadId: string, chunkSize: number) => {
    try {
      let offset = 0;
      const totalSize = file.size;

      while (offset < totalSize) {
        const chunk = file.slice(offset, offset + chunkSize);
        
        const response = await fetch(tusUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/offset+octet-stream',
            'Upload-Offset': offset.toString(),
            'Tus-Resumable': '1.0.0'
          },
          body: chunk
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        offset += chunk.size;
        const progress = Math.round((offset / totalSize) * 100);

        // Update progress
        setUploads(prev => new Map(prev.set(uploadId, {
          ...prev.get(uploadId)!,
          progress
        })));

        // Update server progress
        await fetch(`/api/content/upload/${uploadId}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getIdToken()}`
          },
          body: JSON.stringify({ progress, bytesUploaded: offset })
        });
      }

      // Complete upload
      await fetch(`/api/content/upload/${uploadId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      // Update status to processing
      setUploads(prev => new Map(prev.set(uploadId, {
        ...prev.get(uploadId)!,
        status: 'processing'
      })));

      // Monitor processing
      monitorProcessing(uploadId);
    } catch (error) {
      setUploads(prev => new Map(prev.set(uploadId, {
        ...prev.get(uploadId)!,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    }
  };

  const monitorProcessing = async (uploadId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/content/upload/${uploadId}`, {
          headers: {
            'Authorization': `Bearer ${await user?.getIdToken()}`
          }
        });

        if (response.ok) {
          const status = await response.json();
          
          setUploads(prev => new Map(prev.set(uploadId, {
            ...prev.get(uploadId)!,
            status: status.status
          })));

          if (status.status === 'ready' || status.status === 'failed') {
            return;
          }
        }

        // Continue monitoring
        setTimeout(checkStatus, 3000);
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    checkStatus();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '⬆️';
      case 'processing': return '⚙️';
      case 'ready': return '✅';
      case 'failed': return '❌';
      default: return '📁';
    }
  };

  return (
    <div className="advanced-uploader">
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">🎵</div>
          <h3>Upload Your Beats</h3>
          <p>Drag and drop audio files or click to browse</p>
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="file-input"
          />
          <button className="browse-button">Browse Files</button>
        </div>
      </div>

      {uploads.size > 0 && (
        <div className="uploads-list">
          <h4>Uploads</h4>
          {Array.from(uploads.values()).map((upload) => (
            <div key={upload.uploadId} className="upload-item">
              <div className="upload-info">
                <span className="status-icon">{getStatusIcon(upload.status)}</span>
                <div className="upload-details">
                  <div className="upload-name">Beat Upload</div>
                  <div className="upload-status">{upload.status}</div>
                </div>
              </div>
              
              {upload.status === 'uploading' && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${upload.progress}%` }}
                  />
                  <span className="progress-text">{upload.progress}%</span>
                </div>
              )}

              {upload.status === 'processing' && (
                <div className="processing-indicator">
                  <div className="spinner" />
                  <span>Processing...</span>
                </div>
              )}

              {upload.error && (
                <div className="error-message">{upload.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .advanced-uploader {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          background: rgba(255, 255, 255, 0.05);
        }

        .upload-zone.dragging {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .upload-content {
          position: relative;
          z-index: 2;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-zone h3 {
          color: #fff;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .upload-zone p {
          color: #ccc;
          margin-bottom: 2rem;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .browse-button {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }

        .browse-button:hover {
          background: #5855eb;
        }

        .uploads-list {
          margin-top: 2rem;
        }

        .uploads-list h4 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .upload-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .upload-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .status-icon {
          font-size: 1.5rem;
        }

        .upload-details {
          flex: 1;
        }

        .upload-name {
          color: #fff;
          font-weight: 500;
        }

        .upload-status {
          color: #ccc;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .progress-bar {
          position: relative;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: #6366f1;
          transition: width 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: -25px;
          right: 0;
          color: #ccc;
          font-size: 0.8rem;
        }

        .processing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ccc;
          margin-top: 0.5rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          color: #ef4444;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .advanced-uploader {
            padding: 1rem;
          }

          .upload-zone {
            padding: 2rem 1rem;
          }

          .upload-zone h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}