'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import Navbar from '../components/Navbar';
import LandingView from '../components/LandingView';
import DashboardTab from '../components/DashboardTab';
import LeaderboardTab from '../components/LeaderboardTab';
import MarketplaceTab from '../components/MarketplaceTab';
import DonationTab from '../components/DonationTab';
import FaqTab from '../components/FaqTab';
import { RELAYER_URL, JALPOOL_ADDRESS } from '../lib/contract';

export default function HomePage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('landing');
  const [relayerStats, setRelayerStats] = useState<any>(null);

  // Auto-switch to dashboard when user connects their wallet
  useEffect(() => {
    if (isConnected && activeTab === 'landing') {
      setActiveTab('dashboard');
    }
  }, [isConnected]);

  const fetchRelayerStats = async () => {
    try {
      const res = await axios.get(`${RELAYER_URL}/api/stats`);
      if (res.data) {
        setRelayerStats(res.data);
      }
    } catch (err) {
      setRelayerStats((prev: any) => prev || {
        totalLitersTracked: 14.50,
        telemetriesCount: 8,
        activeDevicesCount: 5,
        recentLogs: []
      });
    }
  };

  useEffect(() => {
    fetchRelayerStats();
    const interval = setInterval(fetchRelayerStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-canvas)' }}>
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCorporatePortal={() => setActiveTab('corporate')}
        />

        <main style={{ padding: '40px 32px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          {/* Unauthenticated State */}
          {!isConnected ? (
            activeTab === 'corporate' ? (
              <MarketplaceTab onBackToLanding={() => setActiveTab('landing')} />
            ) : (
              <LandingView
                onOpenCorporatePortal={() => setActiveTab('corporate')}
                relayerStats={relayerStats}
              />
            )
          ) : (
            /* Authenticated State */
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  relayerStats={relayerStats}
                  onRefreshRelayer={fetchRelayerStats}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardTab
                  relayerStats={relayerStats}
                  onRefreshRelayer={fetchRelayerStats}
                />
              )}

              {activeTab === 'corporate' && (
                <MarketplaceTab onBackToLanding={() => setActiveTab('dashboard')} />
              )}

              {activeTab === 'donations' && (
                <DonationTab />
              )}

              {activeTab === 'faq' && (
                <FaqTab />
              )}
            </>
          )}
        </main>
      </div>

      {/* Minimalist Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#FFFFFF',
        padding: '24px 32px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AquaMon Protocol</span>
            <span>·</span>
            <span>Monad DePIN Ledger</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
            <button
              onClick={() => setActiveTab('corporate')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'corporate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'corporate' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Corporate ESG Portal ↗
            </button>

            <a
              href={`https://testnet.monadexplorer.com/address/${JALPOOL_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
            >
              Contract: {JALPOOL_ADDRESS ? `${JALPOOL_ADDRESS.slice(0, 6)}...${JALPOOL_ADDRESS.slice(-4)}` : '0xBB62...3Dff'} ↗
            </a>
            <span>Chain: 10143</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
