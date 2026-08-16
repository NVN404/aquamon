'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { RELAYER_URL, JALPOOL_ADDRESS } from '../lib/contract';

interface AdminTabProps {
  relayerStats: any;
  onRefreshRelayer: () => void;
}

export default function AdminTab({ relayerStats, onRefreshRelayer }: AdminTabProps) {
  const [triggering, setTriggering] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleTriggerPing = async (deviceId: string, status: string, baseLiters: number) => {
    try {
      setTriggering(true);
      const litersUsed = parseFloat((baseLiters + Math.random() * 0.2).toFixed(2));
      const payload = {
        deviceId,
        litersUsed,
        timestamp: Math.floor(Date.now() / 1000),
        signature: '0x' + Math.random().toString(16).slice(2, 40).padEnd(64, '0'),
        status
      };
      const res = await axios.post(`${RELAYER_URL}/api/telemetry`, payload);
      setLastSent(`Attested ${litersUsed}L from ${deviceId} → Monad Tx: ${res.data.data?.txHash?.slice(0, 10)}...`);
      onRefreshRelayer();
    } catch (err: any) {
      setLastSent(`Telemetry Error: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const sampleDevices = [
    { id: 'AQUAMON-UNIT-101', unit: 'Unit 101', status: 'CONSERVING', flow: 0.15 },
    { id: 'AQUAMON-UNIT-202', unit: 'Unit 202', status: 'NORMAL', flow: 0.35 },
    { id: 'AQUAMON-UNIT-303', unit: 'Unit 303', status: 'LEAK_DETECTED', flow: 1.45 },
    { id: 'AQUAMON-UNIT-404', unit: 'Unit 404', status: 'IDLE', flow: 0.00 },
    { id: 'AQUAMON-UNIT-505', unit: 'Unit 505', status: 'CONSERVING', flow: 0.20 },
    { id: 'AQUAMON-UNIT-606', unit: 'Unit 606', status: 'NORMAL', flow: 0.40 },
    { id: 'AQUAMON-UNIT-707', unit: 'Unit 707', status: 'CONSERVING', flow: 0.10 },
    { id: 'AQUAMON-UNIT-808', unit: 'Unit 808', status: 'NORMAL', flow: 0.30 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-tag badge-alert">Operator Console</span>
            <span className="badge-tag badge-neutral">Building Cluster A</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Apartment Admin & Hardware Telemetry
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Building-wide IoT water sensor matrix. Sponsoring gasless pings to Monad contract <span className="font-mono">{JALPOOL_ADDRESS ? `${JALPOOL_ADDRESS.slice(0, 6)}...` : ''}</span>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={onRefreshRelayer} className="btn-secondary">
            Sync Ledger
          </button>
        </div>
      </div>

      {lastSent && (
        <div style={{ padding: '10px 14px', background: 'var(--pastel-green-bg)', border: '1px solid var(--pastel-green-border)', borderRadius: 'var(--radius-sm)', color: 'var(--pastel-green-text)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
          {lastSent}
        </div>
      )}

      {/* Aggregate Building Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Building Total Flow
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {relayerStats?.totalLitersTracked ? (relayerStats.totalLitersTracked).toFixed(2) : '0.00'} L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>All 8 building units combined</div>
        </div>

        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Monad Attestation TXs
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {relayerStats?.telemetriesCount || '0'} TXs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Sponsored via Relayer proxy</div>
        </div>

        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Active Unit Enclaves
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {relayerStats?.activeDevicesCount || sampleDevices.length} / 8 Online
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>LoRaWAN / ESP32 pulse meters</div>
        </div>
      </div>

      {/* Building-Wide Meter Grid */}
      <div className="card-flat" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
          Active Meter Enclaves (Apartment Cluster A)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {sampleDevices.map((dev) => (
            <div
              key={dev.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'var(--bg-canvas)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dev.unit}</div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{dev.id}</div>
                </div>
                <span className={dev.status === 'CONSERVING' ? 'badge-tag badge-conserving' : dev.status === 'LEAK_DETECTED' ? 'badge-tag badge-alert' : 'badge-tag badge-neutral'}>
                  {dev.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Instant Flow:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>{dev.flow.toFixed(2)} L/s</span>
              </div>

              <button
                onClick={() => handleTriggerPing(dev.id, dev.status, dev.flow)}
                disabled={triggering}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '6px' }}
              >
                Transmit Ping
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
