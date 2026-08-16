'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { RELAYER_URL, JALPOOL_ADDRESS } from '../lib/contract';

interface LeaderboardProps {
  relayerStats: any;
  onRefreshRelayer: () => void;
}

export default function LeaderboardTab({ relayerStats, onRefreshRelayer }: LeaderboardProps) {
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [lastPingMsg, setLastPingMsg] = useState<string | null>(null);

  const handleSimulatePing = async (deviceId: string, status: string, baseLiters: number) => {
    try {
      setTriggeringId(deviceId);
      const litersUsed = parseFloat((baseLiters + Math.random() * 0.15).toFixed(2));
      const payload = {
        deviceId,
        litersUsed,
        timestamp: Math.floor(Date.now() / 1000),
        signature: '0x' + Math.random().toString(16).slice(2, 40).padEnd(64, '0'),
        status
      };
      const res = await axios.post(`${RELAYER_URL}/api/telemetry`, payload);
      setLastPingMsg(`Ping recorded for ${deviceId} (+${litersUsed}L) → Monad Tx: ${res.data.data?.txHash?.slice(0, 10)}...`);
      onRefreshRelayer();
    } catch (err: any) {
      setLastPingMsg(`Error: ${err.message}`);
    } finally {
      setTriggeringId(null);
    }
  };

  // Sync real-time live metrics for Apartment 1A (Unit 101) directly from live Relayer
  const liveUnit101 = relayerStats?.devices?.find((d: any) => 
    d.deviceId === 'AQUAMON-UNIT-101' || d.deviceId === 'JAL-METER-APT-1A'
  );
  const unit101Consumed = liveUnit101 ? parseFloat(liveUnit101.totalLiters) || 0 : 7.73;
  const unit101Saved = Math.max(0, 200 - unit101Consumed);
  const unit101Yield = (unit101Saved / 1000.0).toFixed(4);
  const unit101Status = unit101Consumed > 200 ? 'EXCEEDED' : (unit101Consumed < 50 ? 'TOP_SAVER' : 'CONSERVING');
  const unit101PreservedPct = ((unit101Saved / 200.0) * 100).toFixed(1);

  const leaderboardUnits = [
    { rank: '01', id: 'AQUAMON-UNIT-101', unit: 'Unit 101 (Apt 1A) [Your Node]', consumed: `${unit101Consumed.toFixed(2)} L`, saved: `${unit101Saved.toFixed(2)} L`, yieldAqmon: `${unit101Yield} $AQMON`, streak: '12 Days', status: unit101Status, flow: 0.15, isUser: true },
    { rank: '02', id: 'AQUAMON-UNIT-505', unit: 'Unit 505 (Apt 5E)', consumed: '28.20 L', saved: '171.80 L', yieldAqmon: '0.1718 $AQMON', streak: '9 Days', status: 'TOP_SAVER', flow: 0.20, isUser: false },
    { rank: '03', id: 'AQUAMON-UNIT-707', unit: 'Unit 707 (Apt 7G)', consumed: '42.00 L', saved: '158.00 L', yieldAqmon: '0.1580 $AQMON', streak: '7 Days', status: 'CONSERVING', flow: 0.10, isUser: false },
    { rank: '04', id: 'AQUAMON-UNIT-808', unit: 'Unit 808 (Apt 8H)', consumed: '65.40 L', saved: '134.60 L', yieldAqmon: '0.1346 $AQMON', streak: '5 Days', status: 'CONSERVING', flow: 0.30, isUser: false },
    { rank: '05', id: 'AQUAMON-UNIT-202', unit: 'Unit 202 (Apt 2B)', consumed: '88.10 L', saved: '111.90 L', yieldAqmon: '0.1119 $AQMON', streak: '3 Days', status: 'NORMAL', flow: 0.35, isUser: false },
    { rank: '06', id: 'AQUAMON-UNIT-606', unit: 'Unit 606 (Apt 6F)', consumed: '115.00 L', saved: '85.00 L', yieldAqmon: '0.0850 $AQMON', streak: '1 Day', status: 'NORMAL', flow: 0.40, isUser: false },
    { rank: '07', id: 'AQUAMON-UNIT-404', unit: 'Unit 404 (Apt 4D)', consumed: '0.00 L', saved: '200.00 L', yieldAqmon: '0.0000 $AQMON', streak: 'Idle', status: 'IDLE', flow: 0.00, isUser: false },
    { rank: '08', id: 'AQUAMON-UNIT-303', unit: 'Unit 303 (Apt 3C)', consumed: '245.80 L', saved: '0.00 L', yieldAqmon: '0.0000 $AQMON', streak: 'Exceeded', status: 'EXCEEDED', flow: 1.45, isUser: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-tag badge-neutral">Apartment Rankings</span>
            <span className="badge-tag badge-conserving">Monthly Season 01</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Building Conservation Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Live water conservation efficiency rankings across all apartment units on Monad.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={onRefreshRelayer} className="btn-secondary">
            Sync On-Chain Scores
          </button>
        </div>
      </div>

      {lastPingMsg && (
        <div style={{ padding: '10px 14px', background: 'var(--pastel-green-bg)', border: '1px solid var(--pastel-green-border)', borderRadius: 'var(--radius-sm)', color: 'var(--pastel-green-text)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
          {lastPingMsg}
        </div>
      )}

      {/* Top 3 Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Top Conservation Leader
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Unit 101 (Apt 1A)
          </div>
          <div style={{ fontSize: '0.82rem', color: '#2D5A30', marginTop: '4px' }}>
            {unit101PreservedPct}% Quota Preserved · 12-Day Streak
          </div>
        </div>

        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Building Total Saved Today
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {(800 + unit101Saved).toFixed(2)} Liters
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Against 1,600L daily cluster baseline
          </div>
        </div>

        <div className="card-flat" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Monthly ESG Reward Pool
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            500.00 $AQMON
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Funded by Corporate ESG Sponsors
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card-flat" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            Resident Standings & Verified Water Volume
          </h2>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            Updated every block
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 12px' }}>Rank</th>
                <th style={{ padding: '10px 12px' }}>Apartment Unit</th>
                <th style={{ padding: '10px 12px' }}>Consumed / Cap</th>
                <th style={{ padding: '10px 12px' }}>Water Saved</th>
                <th style={{ padding: '10px 12px' }}>$AQMON Yield</th>
                <th style={{ padding: '10px 12px' }}>Streak</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Simulate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardUnits.map((row) => (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: row.isUser ? '#FAF9F5' : 'transparent'
                  }}
                >
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.isUser ? '#2D5A30' : 'var(--text-secondary)' }}>
                    #{row.rank}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.unit}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{row.id}</div>
                  </td>
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)' }}>
                    {row.consumed} <span style={{ color: 'var(--text-tertiary)' }}>/ 200L</span>
                  </td>
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.status === 'EXCEEDED' ? '#9F2F2D' : '#2D5A30' }}>
                    +{row.saved}
                  </td>
                  <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {row.yieldAqmon}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {row.streak}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={
                      row.status === 'TOP_SAVER' ? 'badge-tag badge-conserving' :
                      row.status === 'CONSERVING' ? 'badge-tag badge-conserving' :
                      row.status === 'NORMAL' ? 'badge-tag badge-neutral' :
                      row.status === 'EXCEEDED' ? 'badge-tag badge-alert' :
                      'badge-tag badge-warning'
                    }>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleSimulatePing(row.id, row.status, row.flow)}
                      disabled={triggeringId === row.id}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      {triggeringId === row.id ? 'Relaying...' : 'Ping'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
