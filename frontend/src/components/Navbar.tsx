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
    { id: 'donations', label: 'Impact Fund' },
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

        {/* Resident Navigation Tabs (Visible when logged in) */}
        {isConnected && activeTab !== 'corporate' && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {residentNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    background: isActive ? 'var(--bg-subtle)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '7px 14px',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'var(--font-sans)',
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
          {/* Corporate Switcher Button on Navbar */}
          {activeTab !== 'corporate' ? (
            <button
              onClick={() => {
                if (onOpenCorporatePortal) onOpenCorporatePortal();
                else setActiveTab('corporate');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Corporate ESG ↗
            </button>
          ) : (
            <button
              onClick={() => {
                if (isConnected) setActiveTab('dashboard');
                else setActiveTab('landing');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              ← Resident View
            </button>
          )}

          {isConnected && address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal()}
              className="btn-primary"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
