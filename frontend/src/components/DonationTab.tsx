'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { JALPOOL_ADDRESS, JALPOOL_ABI } from '../lib/contract';
import { useModal } from '@getpara/react-sdk';

export default function DonationTab() {
  const { address, isConnected } = useAccount();
  const { openModal } = useModal();

  const [selectedNgo, setSelectedNgo] = useState('water-org');
  const [donateAmount, setDonateAmount] = useState('5');
  const [donateStatus, setDonateStatus] = useState<{ loading: boolean; txHash?: string; success?: boolean; error?: string }>({
    loading: false
  });

  const ngos = [
    {
      id: 'water-org',
      name: 'Water.org India Initiative',
      focus: 'Safe Drinking Water Infrastructure',
      wallet: '0x3333333333333333333333333333333333333333',
      impact: '1 $AQMON provisions 1,000L clean drinking water to municipal facilities.'
    },
    {
      id: 'bengaluru-lakes',
      name: 'Urban Wetland Rejuvenation Trust',
      focus: 'Bellandur & Varthur Lake Bioremediation',
      wallet: '0x4444444444444444444444444444444444444444',
      impact: '5 $AQMON funds 10 native bio-filter reed installations in storm drains.'
    },
    {
      id: 'rainwater-india',
      name: 'Rainwater Harvesting Alliance',
      focus: 'Percolation Wells in Drought Zones',
      wallet: '0x5555555555555555555555555555555555555555',
      impact: '10 $AQMON subsidizes 500L community rainwater containment capacity.'
    }
  ];

  const handleDonate = async () => {
    if (!isConnected) {
      openModal();
      return;
    }
    try {
      setDonateStatus({ loading: true });
      const targetNgo = ngos.find((n) => n.id === selectedNgo) || ngos[0];
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Web3 wallet required');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(JALPOOL_ADDRESS, JALPOOL_ABI, signer);

      const parsedAmount = ethers.parseEther(donateAmount);
      const tx = await contract.transfer(targetNgo.wallet, parsedAmount);
      setDonateStatus({ loading: true, txHash: tx.hash });
      await tx.wait();
      setDonateStatus({ loading: false, txHash: tx.hash, success: true });
    } catch (err: any) {
      console.error(err);
      setDonateStatus({ loading: false, error: err.message || 'Donation failed' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge-tag badge-neutral">Public Goods</span>
          <span className="badge-tag badge-conserving">Direct Transfer</span>
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          AquaMon Impact Fund
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
          Donate earned $AQMON tokens to verified non-profit water conservation and lake rehabilitation projects.
        </p>
      </div>

      {/* NGO List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {ngos.map((ngo) => {
          const isSelected = selectedNgo === ngo.id;
          return (
            <div
              key={ngo.id}
              onClick={() => setSelectedNgo(ngo.id)}
              className="card-flat"
              style={{
                padding: '20px',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-subtle)',
                background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{ngo.name}</h2>
                {isSelected && <span className="badge-tag badge-conserving">Selected</span>}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{ngo.focus}</div>
              
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', background: 'var(--bg-canvas)' }}>
                {ngo.impact}
              </div>

              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                {ngo.wallet.slice(0, 10)}...{ngo.wallet.slice(-6)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="card-flat" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
              Amount to Transfer ($AQMON)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              className="input-flat font-mono"
              style={{ width: '120px', height: '36px' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Recipient: <strong style={{ color: 'var(--text-primary)' }}>{ngos.find((n) => n.id === selectedNgo)?.name}</strong>
          </div>
        </div>

        <button
          onClick={handleDonate}
          disabled={donateStatus.loading}
          className="btn-primary"
          style={{ height: '38px' }}
        >
          {donateStatus.loading ? 'Processing Transfer...' : `Transfer ${donateAmount} $AQMON to Cause`}
        </button>
      </div>

      {donateStatus.success && (
        <div style={{ padding: '12px 16px', background: 'var(--pastel-green-bg)', border: '1px solid var(--pastel-green-border)', borderRadius: 'var(--radius-sm)', color: 'var(--pastel-green-text)', fontSize: '0.85rem' }}>
          Transfer of {donateAmount} $AQMON verified on Monad.{' '}
          <a href={`https://testnet.monadexplorer.com/tx/${donateStatus.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--pastel-green-text)', textDecoration: 'underline' }}>
            View Transaction ↗
          </a>
        </div>
      )}

    </div>
  );
}
