'use client';

import React, { useState } from 'react';

export default function FaqTab() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is AquaMon?',
      a: 'AquaMon is a Decentralized Physical Infrastructure Network (DePIN) for municipal and residential water accounting built on Monad. It connects IoT smart water meters to an on-chain ledger that measures water conservation in real time and rewards residents with $AQMON ERC-20 tokens.'
    },
    {
      q: 'What is the Gold Standard Water Benefit Certificate framework?',
      a: 'AquaMon conforms to the internationally recognized Gold Standard Water Benefit Certificate rules: 1 cubic meter (1,000 Liters) of verified water saved = 1 $AQMON token. This gives $AQMON tangible real-world environmental backing for corporate ESG compliance.'
    },
    {
      q: 'Who pays the gas fees for smart meter telemetry?',
      a: 'The AquaMon Relayer proxy sponsors 100% of transaction gas on Monad. Residents do not sign transactions or hold MON tokens when turning on water taps. The relayer recoups infrastructure gas costs via a 1.5% institutional fee during corporate water credit retirements.'
    },
    {
      q: 'Why settle telemetry on Monad instead of other blockchains?',
      a: 'Monad provides 10,000 TPS, 400ms block times, and sub-second finality with sub-penny gas fees. On traditional L1s, sponsoring continuous pings across thousands of apartments is cost-prohibitive; on Monad, streaming continuous telemetry for an entire residential complex costs under a few cents daily.'
    },
    {
      q: 'What hardware standards are supported?',
      a: 'AquaMon is hardware-agnostic. It ingests cryptographically signed telemetry from low-cost ESP32 microcontrollers paired with pulse flow sensors, or interfaces with commercial smart meters deployed globally via LoRaWAN and NB-IoT.'
    },
    {
      q: 'How do enterprises utilize $AQMON tokens?',
      a: 'Corporations acquire $AQMON tokens to fulfill statutory CSR requirements (e.g. 2% net profit mandate in India) and global Water Positive pledges. Tokens are irreversibly retired on-chain to prevent duplicate accounting.'
    },
    {
      q: 'How do residents redeem their earned tokens?',
      a: 'Residents can apply $AQMON tokens directly toward monthly HOA maintenance bill credits, hardware discounts, or transfer them to verified water conservation non-profits.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '840px' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge-tag badge-neutral">Protocol Specifications</span>
        </div>
        <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          Documentation & FAQ
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '6px' }}>
          Technical architecture, token economics, hardware enclaves, and Monad parallel EVM settlement.
        </p>
      </div>

      {/* Accordion List with minimal bottom borders */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                padding: '20px 0',
                transition: 'all 0.15s ease'
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                <span>{faq.q}</span>
                <span className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginLeft: '16px' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
