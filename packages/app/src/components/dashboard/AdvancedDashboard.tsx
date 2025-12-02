'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { MobileMetricCard } from '@/components/MobileMetricCard';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

interface DashboardMetrics {
  overview: {
    totalBeats: number;
    totalPlays: number;
    totalEarnings: number;
    conversionRate: string;
  };
  activity: Array<{
    id: string;
    type: string;
    beat_title: string;
    user_name: string;
    created_at: string;
  }>;
  topPerforming: Array<{
    id: string;
    title: string;
    plays: number;
    earnings: number;
  }>;
}

interface AnalyticsData {
  sessions: {
    total: number;
    avgDuration: number;
    devices: Record<string, number>;
  };
  interactions: {
    plays: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  engagement: number;
}

export function AdvancedDashboard() {
  const { user } = useUnifiedAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - will connect to analytics API
      setMetrics({
        overview: {
          totalBeats: 24,
          totalPlays: 1250,
          totalEarnings: 450.75,
          conversionRate: '3.2'
        },
        activity: [
          { id: '1', type: 'play', beat_title: 'Amapiano Vibes', user_name: 'DJ Mike', created_at: new Date().toISOString() },
          { id: '2', type: 'purchase', beat_title: 'Trap Beat #5', user_name: 'Producer X', created_at: new Date().toISOString() }
        ],
        topPerforming: [
          { id: '1', title: 'Amapiano Vibes', plays: 340, earnings: 125.50 },
          { id: '2', title: 'Trap Beat #5', plays: 280, earnings: 98.25 }
        ]
      });
      
      setAnalytics({
        sessions: { total: 45, avgDuration: 180, devices: { mobile: 28, desktop: 17 } },
        interactions: { plays: 1250, likes: 89, shares: 23, purchases: 12 },
        engagement: 78
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="dashboard-container">
          <div className="loading-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Producer Dashboard</h1>
          <div className="time-range-selector">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`time-button ${timeRange === range ? 'active' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="metrics-grid">
          <MobileMetricCard
            title="Total Beats"
            value={metrics?.overview.totalBeats.toString() || '0'}
            icon="🎵"
            trend={12}
            loading={false}
          />
          <MobileMetricCard
            title="Total Plays"
            value={metrics?.overview.totalPlays.toLocaleString() || '0'}
            icon="▶️"
            trend={8}
            loading={false}
          />
          <MobileMetricCard
            title="Total Earnings"
            value={`$${metrics?.overview.totalEarnings || 0}`}
            icon="💰"
            trend={15}
            loading={false}
          />
          <MobileMetricCard
            title="Conversion Rate"
            value={`${metrics?.overview.conversionRate || 0}%`}
            icon="📈"
            trend={3}
            loading={false}
          />
        </div>

        <div className="analytics-section">
          <h2>Performance Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Engagement Score</h3>
              <div className="engagement-score">
                <div className="score-circle">
                  <span className="score-value">{analytics?.engagement || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="analytics-card">
              <h3>User Interactions</h3>
              <div className="interaction-stats">
                <div className="stat-item">
                  <span>▶️ Plays: {analytics?.interactions.plays || 0}</span>
                </div>
                <div className="stat-item">
                  <span>❤️ Likes: {analytics?.interactions.likes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
          margin: 0;
        }

        .time-range-selector {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 4px;
        }

        .time-button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .time-button.active {
          background: #6366f1;
          color: #fff;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .analytics-section h2 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .analytics-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .analytics-card h3 {
          color: #fff;
          margin-bottom: 1rem;
        }

        .engagement-score {
          text-align: center;
        }

        .score-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #6366f1;
        }

        .score-value {
          color: #fff;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .interaction-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-item {
          color: #ccc;
        }

        .loading-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .skeleton-card {
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0.5rem;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ResponsiveLayout>
  );
}