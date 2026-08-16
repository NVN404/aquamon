'use client';

import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from '@getpara/react-sdk';

interface MarketplaceProps {
  onBackToLanding?: () => void;
}

export default function MarketplaceTab({ onBackToLanding }: MarketplaceProps) {
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  const [companyName, setCompanyName] = useState('Google India Cloud');
  const [purchaseAmount, setPurchaseAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [certificateData, setCertificateData] = useState<{
    certId: string;
    company: string;
    liters: number;
    cubicMeters: number;
    costUsd: number;
    txHash: string;
    blockNumber: number;
    timestamp: string;
  } | null>(null);

  const certRef = useRef<HTMLDivElement>(null);

  const calculatedLiters = (parseInt(purchaseAmount) || 0) * 1000;
  const calculatedCostUsd = (parseInt(purchaseAmount) || 0) * 1.25;

  const handleGenerateCertificate = () => {
    if (!isConnected) {
      openModal();
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const mockTx = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const cert = {
        certId: `AQMON-WBC-${Math.floor(100000 + Math.random() * 900000)}`,
        company: companyName.trim() || 'Institutional ESG Beneficiary',
        liters: calculatedLiters,
        cubicMeters: parseInt(purchaseAmount) || 0,
        costUsd: calculatedCostUsd,
        txHash: mockTx,
        blockNumber: 14820942,
        timestamp: new Date().toUTCString(),
      };
      setCertificateData(cert);
      setIsProcessing(false);
    }, 1200);
  };

  // Pure HTML5 Canvas Generator for Instant PNG Download (0 dependencies)
  const handleDownloadPNG = () => {
    if (!certificateData) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Canvas
    ctx.fillStyle = '#FAF9F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Double Border
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#CCCCCC';
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Header Protocol Tag
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText('AQUAMON WATER PROTOCOL · MONAD DEPIN LEDGER', 70, 95);

    // Certificate Serial ID
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#111111';
    ctx.fillText(`SERIAL: ${certificateData.certId}`, canvas.width - 70, 95);
    ctx.textAlign = 'left';

    // Title
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#111111';
    ctx.fillText('Certificate of Water Benefit Retirement', 70, 160);

    // Divider Line
    ctx.strokeStyle = '#E0E0DE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 185);
    ctx.lineTo(canvas.width - 70, 185);
    ctx.stroke();

    // Attestation Statement
    ctx.font = '19px sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText('This is to officially certify that verified residential water conservation has been', 70, 230);
    ctx.fillText('permanently retired on the Monad Parallel EVM on behalf of:', 70, 260);

    // Corporate Name Box
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.fillRect(70, 290, canvas.width - 140, 75);
    ctx.strokeRect(70, 290, canvas.width - 140, 75);

    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = '#111111';
    ctx.fillText(certificateData.company, 95, 340);

    // Metric Summary Grid
    const boxY = 395;
    const boxWidth = 320;
    const boxHeight = 110;

    // Box 1: Liters Offset
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1;
    ctx.fillRect(70, boxY, boxWidth, boxHeight);
    ctx.strokeRect(70, boxY, boxWidth, boxHeight);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText('VOLUME RETIRED', 90, boxY + 30);
    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#2D5A30';
    ctx.fillText(`${certificateData.liters.toLocaleString()} Liters`, 90, boxY + 68);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText(`(${certificateData.cubicMeters} m³ / $AQMON Units)`, 90, boxY + 92);

    // Box 2: Network
    ctx.fillRect(440, boxY, boxWidth, boxHeight);
    ctx.strokeRect(440, boxY, boxWidth, boxHeight);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText('SETTLEMENT BLOCKCHAIN', 460, boxY + 30);
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillStyle = '#111111';
    ctx.fillText('Monad Parallel EVM', 460, boxY + 68);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('Chain ID: 10143 (Testnet)', 460, boxY + 92);

    // Box 3: Standard & Timestamp
    ctx.fillRect(810, boxY, boxWidth, boxHeight);
    ctx.strokeRect(810, boxY, boxWidth, boxHeight);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText('COMPLIANCE STANDARD', 830, boxY + 30);
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#111111';
    ctx.fillText('Gold Standard WBC', 830, boxY + 68);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('Auditable CSR / GRI 303', 830, boxY + 92);

    // On-Chain Attestation Footer
    ctx.font = '14px monospace';
    ctx.fillStyle = '#333333';
    ctx.fillText(`Monad Burn Tx: ${certificateData.txHash}`, 70, 560);
    ctx.fillText(`Block Number: ${certificateData.blockNumber}  |  Issuance Date: ${certificateData.timestamp}`, 70, 590);
    ctx.fillText('Cryptographic Proof: 100% Attested IoT Sensor Streams · Irreversibly Burnt', 70, 620);

    // Official Seal Stamp (Bottom Right)
    ctx.beginPath();
    ctx.arc(canvas.width - 140, 640, 45, 0, Math.PI * 2);
    ctx.strokeStyle = '#2D5A30';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#2D5A30';
    ctx.textAlign = 'center';
    ctx.fillText('AQUAMON', canvas.width - 140, 635);
    ctx.fillText('VERIFIED', canvas.width - 140, 650);
    ctx.textAlign = 'left';

    // Trigger Instant Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `AquaMon-ESG-Certificate-${certificateData.certId}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-tag badge-neutral">Institutional ESG Portal</span>
            <span className="badge-tag badge-conserving">Gold Standard Water Benefit Certificate</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Corporate Water Offset & Certificate Issuance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Acquire verified residential water conservation units ($AQMON) and permanently retire them on Monad to receive an auditable ESG Water Positive Certificate.
          </p>
        </div>

        {onBackToLanding && (
          <button onClick={onBackToLanding} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            ← Back to Main Protocol
          </button>
        )}
      </div>

      {/* Corporate Purchase Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        
        {/* Left: Offset Form */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
            Acquire & Retire Water Credits
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Enter your corporate entity details to generate an immutable on-chain certificate:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Corporate Beneficiary Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Microsoft Corporation / Tata Consultancy"
                className="input-flat"
                style={{ width: '100%', height: '40px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Volume to Offset ($AQMON / m³)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="input-flat font-mono"
                  style={{ flex: 1, fontSize: '1.1rem', height: '42px' }}
                />
                <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>$AQMON</span>
              </div>
            </div>

            {/* Calculations */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Water Volume Offset:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{calculatedLiters.toLocaleString()} Liters ({purchaseAmount} m³)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Market Price ($1.25 / m³):</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>${calculatedCostUsd.toLocaleString()} USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Protocol Relayer Fee (1.5%):</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>${(calculatedCostUsd * 0.015).toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleGenerateCertificate}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '42px' }}
            >
              {isProcessing ? 'Retiring Credits on Monad...' : isConnected ? 'Retire Credits & Generate Certificate →' : 'Connect Corporate Wallet & Retire →'}
            </button>
          </div>
        </div>

        {/* Right: Verification Architecture */}
        <div className="card-flat" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Audit & Compliance Standard
          </h2>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>100% IoT Telemetry Backed</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Every retired unit corresponds to physical pulse data gathered from apartment flow sensors and settled on Monad.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Irreversible On-Chain Burning</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Retired credits are permanently burnt on-chain with verifiable transaction hashes to eliminate duplicate claims.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Statutory CSR & ESG Compliance</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Suitable for mandatory Section 135 CSR reports in India and global GRI 303 / CDP Water Security disclosures.
            </p>
          </div>
        </div>

      </div>

      {/* Generated ESG Certificate Display */}
      {certificateData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              Official ESG Water Benefit Certificate
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDownloadPNG}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                ⬇ Download Official Certificate (PNG)
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                Print / Save PDF ↗
              </button>
            </div>
          </div>

          {/* Editorial Certificate Container */}
          <div
            ref={certRef}
            style={{
              backgroundColor: '#FAF9F5',
              border: '2px solid #111111',
              borderRadius: 'var(--radius-sm)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              position: 'relative'
            }}
          >
            {/* Certificate Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  AQUAMON WATER PROTOCOL · MONAD DEPIN LEDGER
                </div>
                <h3 className="font-serif" style={{ fontSize: '2rem', fontWeight: 400, marginTop: '4px', letterSpacing: '-0.02em' }}>
                  Certificate of Water Benefit Retirement
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {certificateData.certId}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Standard: WBC-2026-RWA
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                This is to officially certify that an attested volume of verified residential water conservation has been irreversibly retired on the Monad blockchain on behalf of:
              </p>
              
              <div style={{ margin: '18px 0', padding: '16px 20px', backgroundColor: '#FFFFFF', border: '1px solid #111111' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {certificateData.company}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Issued for corporate Water Positive offset & Environmental Social Governance (ESG) compliance.
                </div>
              </div>
            </div>

            {/* Volume Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '20px 0' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Volume Retired
                </div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#2D5A30' }}>
                  {certificateData.liters.toLocaleString()} Liters
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({certificateData.cubicMeters} m³ / $AQMON Units)</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Settlement Blockchain
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '4px' }}>
                  Monad Parallel EVM
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chain ID: 10143 (Testnet)</div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Issuance Date
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>
                  {certificateData.timestamp}
                </div>
              </div>
            </div>

            {/* Blockchain Attestation Proof */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Monad Burn Tx:</strong>{' '}
                <a
                  href={`https://testnet.monadexplorer.com/tx/${certificateData.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
                >
                  {certificateData.txHash} ↗
                </a>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Block Number:</strong> {certificateData.blockNumber} · <strong>Status:</strong> FINALIZED ON MONAD
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
