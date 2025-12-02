'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  audio_url: string;
}

export function SmartRecommendations() {
  const { user } = useUnifiedAuth();
  const [sections, setSections] = useState([
    { title: 'For You', beats: [], loading: true },
    { title: 'Trending Now', beats: [], loading: true },
    { title: 'New Releases', beats: [], loading: true }
  ]);

  useEffect(() => {
    loadRecommendations();
  }, [user?.uid]);

  const loadRecommendations = async () => {
    try {
      // Mock data for now
      const mockBeats = [
        { id: '1', title: 'Amapiano Vibes', genre: 'Amapiano', bpm: 112, audio_url: '' },
        { id: '2', title: 'Trap Heat', genre: 'Trap', bpm: 140, audio_url: '' },
        { id: '3', title: 'Afrobeat Flow', genre: 'Afrobeat', bpm: 128, audio_url: '' }
      ];

      setSections([
        { title: 'For You', beats: mockBeats, loading: false },
        { title: 'Trending Now', beats: mockBeats, loading: false },
        { title: 'New Releases', beats: mockBeats, loading: false }
      ]);
    } catch (error) {
      console.error('Load recommendations error:', error);
      setSections(prev => prev.map(section => ({ ...section, loading: false })));
    }
  };

  const BeatCard = ({ beat }: { beat: Beat }) => (
    <div className="beat-card">
      <div className="beat-cover">
        <div className="default-cover">🎵</div>
        <button className="play-button">▶️</button>
      </div>
      <div className="beat-info">
        <h4>{beat.title}</h4>
        <p>{beat.genre} • {beat.bpm} BPM</p>
      </div>
    </div>
  );

  return (
    <div className="smart-recommendations">
      {sections.map((section, index) => (
        <div key={index} className="recommendation-section">
          <div className="section-header">
            <h2>{section.title}</h2>
          </div>

          {section.loading ? (
            <div className="loading-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="beats-grid">
              {section.beats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .smart-recommendations {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .recommendation-section {
          margin-bottom: 3rem;
        }

        .section-header h2 {
          color: #fff;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .beats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .beat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .beat-card:hover {
          transform: translateY(-4px);
        }

        .beat-cover {
          position: relative;
          aspect-ratio: 1;
        }

        .default-cover {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          font-size: 2rem;
        }

        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .beat-card:hover .play-button {
          opacity: 1;
        }

        .beat-info {
          padding: 1rem;
        }

        .beat-info h4 {
          color: #fff;
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .beat-info p {
          color: #ccc;
          margin: 0;
          font-size: 0.9rem;
        }

        .loading-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .skeleton-card {
          height: 280px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .smart-recommendations {
            padding: 1rem;
          }

          .beats-grid,
          .loading-skeleton {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}