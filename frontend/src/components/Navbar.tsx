'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useModal } from '@getpara/react-sdk';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCorporatePortal?: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenCorporatePortal }: NavbarProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openModal } = useModal();

  const residentNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'impact', label: 'Impact Fund' },
    { id: 'faq', label: 'Documentation' },
  ];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 32px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        {/* Brand */}
        <div 
          onClick={() => {
            if (isConnected) setActiveTab('dashboard');
            else setActiveTab('landing');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#111111',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}>
            A
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AquaMon
            </span>
            <span className="badge-tag badge-neutral" style={{ fontSize: '0.65rem' }}>
              Monad Testnet
            </span>
          </div>
        </div>

        {/* Resident Tabs (Visible when connected) */}
        {isConnected && (
          <nav style={{ display: 'flex', gap: '4px' }}>
            {residentNavItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'impact' && activeTab === 'donations');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--bg-canvas)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onOpenCorporatePortal && (
            <button
              onClick={onOpenCorporatePortal}
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px'
              }}
            >
              Corporate ESG ↗
            </button>
          )}

          {!isConnected ? (
            <button onClick={() => openModal()} className="btn-primary">
              Connect Resident Node
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="badge-tag badge-neutral font-mono" style={{ fontSize: '0.78rem' }}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
              </div>
              <button 
                onClick={() => disconnect()}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
