'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import axios from 'axios';
import { JALPOOL_ADDRESS, JALPOOL_ABI, MONAD_RPC_URL, RELAYER_URL } from '../lib/contract';
import { useModal } from '@getpara/react-sdk';

interface DashboardProps {
  relayerStats: any;
  onRefreshRelayer: () => void;
}

export default function DashboardTab({ relayerStats, onRefreshRelayer }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { openModal } = useModal();

  const assignedMeterId = 'AQUAMON-UNIT-101';
  const assignedUnit = 'Apartment 1A';

  const [onChainStats, setOnChainStats] = useState({
    totalLiters: '0.00',
    currentDayLiters: '0.00',
    pendingRewardsAqmon: '0.0000',
    totalClaimedAqmon: '0.0000',
    pingsLogged: '0',
    aqmonBalance: '0.0000',
    loading: false
  });

  const [claimStatus, setClaimStatus] = useState<{ loading: boolean; txHash?: string; error?: string }>({
    loading: false
  });

  // State to simulate epoch closing in live hackathon demo
  const [epochSettled, setEpochSettled] = useState(false);

  // Target query address is the user's connected wallet (or fallback default)
  const targetAddress = address || '0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352';

  // Automatically pair connected wallet with assigned meter on the Relayer
  useEffect(() => {
    if (address) {
      axios.post(`${RELAYER_URL}/api/pair-device`, {
        deviceId: assignedMeterId,
        residentWallet: address
      }).catch(() => {});

      axios.post(`${RELAYER_URL}/api/pair-device`, {
        deviceId: 'JAL-METER-APT-1A',
        residentWallet: address
      }).catch(() => {});
    }
  }, [address]);

  const fetchOnChainStats = async () => {
    if (!JALPOOL_ADDRESS) return;
    try {
      const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
      const contract = new ethers.Contract(JALPOOL_ADDRESS, JALPOOL_ABI, provider);

      const stats = await contract.getResidentStats(targetAddress);
      const balance = await contract.balanceOf(targetAddress);

      setOnChainStats({
        totalLiters: (Number(stats[0]) || 0).toFixed(2),
        currentDayLiters: (Number(stats[1]) || 0).toFixed(2),
        pendingRewardsAqmon: ethers.formatEther(stats[2] || 0n),
        totalClaimedAqmon: ethers.formatEther(stats[3] || 0n),
        pingsLogged: (stats[4] || 0n).toString(),
        aqmonBalance: ethers.formatEther(balance || 0n),
        loading: false
      });
    } catch (err) {
      console.warn('Could not read Monad onchain stats:', err);
    }
  };

  useEffect(() => {
    fetchOnChainStats();
    // Fast 800ms real-time polling to match Monad's sub-second parallel finality
    const interval = setInterval(() => {
      fetchOnChainStats();
      onRefreshRelayer();
    }, 800);
    return () => clearInterval(interval);
  }, [targetAddress]);

  const handleClaim = async () => {
    if (!isConnected) {
      openModal();
      return;
    }
    try {
      setClaimStatus({ loading: true, error: undefined });
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Web3 wallet required');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(JALPOOL_ADDRESS, JALPOOL_ABI, signer);
      const tx = await contract.claimTokens();
      setClaimStatus({ loading: true, txHash: tx.hash });
      await tx.wait();
      setClaimStatus({ loading: false, txHash: tx.hash });
      setEpochSettled(false);
      fetchOnChainStats();
    } catch (err: any) {
      console.error(err);
      setClaimStatus({ loading: false, error: err.message || 'Claim failed' });
    }
  };

  // Extract high-precision volume from live relayer stream or fallback to onchain
  const activeDeviceData = relayerStats?.devices?.find((d: any) => 
    d.deviceId === assignedMeterId || 
    (d.residentWallet && targetAddress && d.residentWallet.toLowerCase() === targetAddress.toLowerCase())
  );

  const rawUsage = activeDeviceData?.totalLiters !== undefined 
    ? activeDeviceData.totalLiters 
    : parseFloat(onChainStats.currentDayLiters) || 0;

  const dailyCap = 200;
  const currentUsageNum = typeof rawUsage === 'number' ? rawUsage : parseFloat(rawUsage) || 0;
  const waterSavedNum = Math.max(0, dailyCap - currentUsageNum);
  const usageRatio = Math.min(1, currentUsageNum / dailyCap);
  const isConserving = currentUsageNum <= dailyCap;

  // Projected today's yield based strictly on water saved
  const projectedAqmonToday = isConserving ? (waterSavedNum / 1000.0) : 0.0;

  const formatLogTime = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts > 1000000000000 ? ts : ts * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-tag badge-neutral">Apartment Node</span>
            <span className={isConserving ? "badge-tag badge-conserving" : "badge-tag badge-alert"}>
              {isConserving ? "Today: Quota Preserved" : "Today: High Volume"}
            </span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
            Apartment Water Accounting
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
            Telemetry attested on Monad. Linked Unit: <strong style={{ color: 'var(--text-primary)' }}>{assignedUnit} ({assignedMeterId})</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dot-indicator" />
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            Live Epoch in Progress (Settles 00:00 UTC)
          </span>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Water Saved Today */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '12px' }}>
            Water Saved Today
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 600, color: isConserving ? '#2D5A30' : '#9F2F2D' }}>
              +{waterSavedNum.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Liters</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Preserved below 200L daily baseline
          </div>
        </div>

        {/* Metric 2: Daily Consumption */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '12px' }}>
            Today's Water Used
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUsageNum.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 200.00 L Cap</span>
          </div>
          {/* Flat Progress Bar */}
          <div style={{ marginTop: '14px', width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${usageRatio * 100}%`,
              height: '100%',
              background: isConserving ? '#2D5A30' : '#9F2F2D',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Metric 3: Today's Projected Yield & Epoch Claim Status */}
        <div className="card-flat" style={{ padding: '24px', backgroundColor: '#FAF9F5', borderColor: 'var(--border-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Today's Projected Yield
            </div>
            <span className="badge-tag badge-neutral" style={{ fontSize: '0.68rem' }}>
              {epochSettled ? "Epoch Audited" : "In Progress"}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {projectedAqmonToday.toFixed(4)}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>$AQMON</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            {epochSettled ? (
              <button
                onClick={handleClaim}
                disabled={claimStatus.loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {claimStatus.loading ? 'Claiming on Monad...' : 'Claim Finalized Epoch Yield'}
              </button>
            ) : (
              <button
                disabled
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', opacity: 0.75, cursor: 'not-allowed', fontSize: '0.8rem' }}
              >
                🔒 Today's Epoch in Progress (Claim Tomorrow)
              </button>
            )}

            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.4 }}>
              {epochSettled ? (
                'Daily epoch audited! Tokens ready to withdraw to wallet.'
              ) : (
                "Claims locked until 00:00 UTC to prevent midday exploit."
              )}
            </div>

            {/* Judge Demo Fast-Forward Button */}
            {!epochSettled && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  onClick={() => setEpochSettled(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    textDecoration: 'underline',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  ⚡ [Judge Demo: Settle Epoch Now]
                </button>
              </div>
            )}

            {claimStatus.txHash && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', textAlign: 'center' }}>
                <a 
                  href={`https://testnet.monadexplorer.com/tx/${claimStatus.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
                >
                  View Monad Receipt ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Metric 4: Wallet Balance */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '12px' }}>
            Wallet Holdings & Telemetry
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {parseFloat(onChainStats.aqmonBalance).toFixed(2)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>$AQMON</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Attested Pings:</span>
            <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{onChainStats.pingsLogged}</span>
          </div>
        </div>

      </div>

      {/* Utility Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        
        {/* Left: Resident Utility Redemptions */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
            Utility Offsets & Credits
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Redeem earned conservation units against residential expenses:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>HOA Facility Maintenance Offset</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>10 $AQMON = $10.00 credit on monthly bill</div>
              </div>
              <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Redeem</button>
            </div>

            <div style={{ padding: '12px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Filtration Cartridge Subsidy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>15 $AQMON = 25% discount voucher</div>
              </div>
              <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Redeem</button>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Ledger */}
        <div className="card-flat" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Live Telemetry Ledger
            </h2>
            <button onClick={onRefreshRelayer} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Sync
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {relayerStats?.recentLogs && relayerStats.recentLogs.length > 0 ? (
              relayerStats.recentLogs.slice(0, 5).map((log: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="dot-indicator" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', minWidth: '58px' }}>
                      {formatLogTime(log.timestamp)}
                    </span>
                    <span style={{ fontWeight: 600 }}>{log.deviceId}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>+{log.litersUsed}L</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={log.status === 'CONSERVING' ? 'badge-tag badge-conserving' : 'badge-tag badge-neutral'}>
                      {log.status}
                    </span>
                    {log.txHash && (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${log.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Awaiting incoming hardware signals...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
