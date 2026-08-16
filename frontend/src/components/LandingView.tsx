'use client';

import React from 'react';
import { useModal } from '@getpara/react-sdk';

interface LandingViewProps {
  onOpenCorporatePortal: () => void;
  relayerStats: any;
}

export default function LandingView({ onOpenCorporatePortal, relayerStats }: LandingViewProps) {
  const { openModal } = useModal();
  const bgImageUrl = "https://imgs.search.brave.com/1WAqXt76oeWgJzHykrhVxTkyJKrPp4Eh5FjEpSZg5us/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTA4/MjYwNDAvcGhvdG8v/ZmFubmluZy1zcHJp/bmdzLTEuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPWp3a21k/Z1pCVnBKZTdCZW9m/M0gwZjZJN2NpZTN4/Y2FsVTRiNDRRY1BT/Rnc9";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Section with Spring Water Backdrop */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        padding: '70px 24px',
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
      }}>
        {/* Glassmorphic Centered Card */}
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-md)',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span className="badge-tag badge-neutral" style={{ backgroundColor: '#FFFFFF' }}>AquaMon Protocol</span>
            <span className="badge-tag badge-conserving" style={{ backgroundColor: '#E8F5E9' }}>Live on Monad Testnet</span>
          </div>

          <h1 className="font-serif" style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 400,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#111111',
            marginBottom: '20px'
          }}>
            The verifiable water ledger for residential conservation & ESG offsets.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#333333',
            maxWidth: '680px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
            fontWeight: 450
          }}>
            AquaMon connects IoT pulse meters to Monad parallel EVM. We turn verified residential water conservation into Gold Standard Water Benefit Certificates ($AQMON) with zero gas friction.
          </p>

          {/* Dual Entry CTAs: Residents vs Corporate */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openModal()}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '0.96rem', fontWeight: 600 }}
            >
              Resident Portal: Connect Wallet →
            </button>
            <button
              onClick={onOpenCorporatePortal}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: '0.96rem', fontWeight: 600, backgroundColor: '#FFFFFF' }}
            >
              Corporate ESG Offset Portal ↗
            </button>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.78rem', color: '#555555', fontWeight: 500 }}>
            Residents earn $AQMON · Corporations retire auditable on-chain certificates
          </div>
        </div>
      </section>

      {/* Protocol Metrics Bar */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '32px 0'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '6px' }}>
            Verified Water Tracked
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {relayerStats?.totalLitersTracked ? `${(relayerStats.totalLitersTracked).toFixed(1)} L` : '14.50 L'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Cryptographically anchored</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '6px' }}>
            Settlement Speed
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            10,000 TPS
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Monad parallel execution</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '6px' }}>
            Resident Gas Cost
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: '#2D5A30' }}>
            $0.00 Gasless
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Sponsored via Relayer proxy</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '6px' }}>
            RWA Certificate Standard
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            1 m³ = 1 $AQMON
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Gold Standard compliant</div>
        </div>
      </section>

      {/* How It Works (3-Step Bento Architecture) */}
      <section>
        <div style={{ marginBottom: '28px' }}>
          <span className="badge-tag badge-neutral">System Architecture</span>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 400, marginTop: '8px', color: 'var(--text-primary)' }}>
            From Sensor Pulse to Irreversible Proof
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            How AquaMon orchestrates hardware telemetry and high-throughput consensus.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div className="card-flat" style={{ padding: '28px' }}>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
              01 / EDGE TELEMETRY
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>
              Hardware Pulse Measurement
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Low-cost ESP32 microcontrollers and commercial LoRaWAN meters calculate real-time flow rate, sign the packet with a cryptographic enclave key, and dispatch telemetry.
            </p>
          </div>

          <div className="card-flat" style={{ padding: '28px' }}>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
              02 / PARALLEL SETTLEMENT
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>
              Gasless Relayer on Monad
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The AquaMon Relayer batches and submits transactions to the <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '2px 4px', borderRadius: '4px' }}>AquaMonPool</code> contract. Monad executes continuous pings in under 800ms with sub-penny fees.
            </p>
          </div>

          <div className="card-flat" style={{ padding: '28px' }}>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
              03 / ECONOMIC LOOP
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>
              $AQMON Yield & Corporate Offset
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Conserving residents earn $AQMON tokens for utility bill credits, while enterprises purchase and permanently retire credits to satisfy statutory CSR and ESG pledges.
            </p>
          </div>

        </div>
      </section>

      {/* Two Stakeholder Tracks */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Track 1: Residents */}
        <div className="card-flat" style={{ padding: '32px' }}>
          <div className="badge-tag badge-conserving" style={{ marginBottom: '16px' }}>For Apartment Residents</div>
          <h3 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '12px' }}>
            Automated Conservation Rewards
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Track daily water flow against the 200L baseline quota. Conserve volume and claim liquid $AQMON tokens redeemable for HOA maintenance fee deductions.
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary"
            style={{ fontSize: '0.86rem', padding: '8px 18px' }}
          >
            Connect Resident Wallet →
          </button>
        </div>

        {/* Track 2: Enterprises */}
        <div className="card-flat" style={{ padding: '32px' }}>
          <div className="badge-tag badge-neutral" style={{ marginBottom: '16px' }}>For Corporations & ESG Funds</div>
          <h3 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '12px' }}>
            Auditable Water Positive Credits
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Fulfill mandatory Indian CSR requirements (2% of net profits) and global environmental pledges with verifiable, hardware-backed water conservation assets.
          </p>
          <button
            onClick={onOpenCorporatePortal}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '8px 18px' }}
          >
            Open Corporate ESG Portal ↗
          </button>
        </div>

      </section>

      {/* Bottom Launch Banner */}
      <section className="card-flat" style={{
        padding: '48px 40px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-strong)'
      }}>
        <h2 className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 400, marginBottom: '12px' }}>
          Get Started with AquaMon
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 28px' }}>
          Select your portal to access residential rewards or corporate water credit retirements.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => openModal()}
            className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '0.95rem' }}
          >
            Resident Portal →
          </button>
          <button
            onClick={onOpenCorporatePortal}
            className="btn-secondary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            Corporate ESG Portal ↗
          </button>
        </div>
      </section>

    </div>
  );
}
