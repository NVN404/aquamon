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
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('landing');
  const [relayerStats, setRelayerStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBFA', color: '#111110', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D5A30' }} />
          <span>Loading AquaMon Protocol...</span>
        </div>
      </div>
    );
  }

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
                <MarketplaceTab
                  onBackToLanding={() => setActiveTab('dashboard')}
                />
              )}

              {activeTab === 'impact' && (
                <DonationTab />
              )}

              {activeTab === 'faq' && (
                <FaqTab />
              )}
            </>
          )}
        </main>
      </div>

      {/* Protocol Global Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <div>
          <strong>AquaMon Protocol</strong> · Monad DePIN Ledger
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('corporate')}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            Corporate ESG Portal ↗
          </button>
          <a
            href={`https://testnet.monadexplorer.com/address/${JALPOOL_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Contract: {JALPOOL_ADDRESS ? `${JALPOOL_ADDRESS.slice(0, 6)}...${JALPOOL_ADDRESS.slice(-4)}` : 'Unset'} ↗
          </a>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Chain: 10143</span>
        </div>
      </footer>
    </div>
  );
}
