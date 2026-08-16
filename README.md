# 🌊 AquaMon Protocol — Verifiable Water Conservation DePIN on Monad

> **The Decentralized Physical Infrastructure Network (DePIN) turning residential water conservation into Gold Standard Water Benefit Certificates ($AQMON) with parallel EVM consensus on Monad.**

[![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet%20(10143)-836EF9?style=flat-square)](https://testnet.monadexplorer.com/)
[![Smart Contract](https://img.shields.io/badge/Contract-0xCce77B...98F9E1-00F5D4?style=flat-square)](https://testnet.monadexplorer.com/address/0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary & Pitch Checklist

| Pitch Item | Submission Link / Parameter |
|---|---|
| **Protocol Name** | **AquaMon** |
| **Token Symbol** | **`$AQMON`** (ERC-20 on Monad) |
| **Verified Contract Address** | [`0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1`](https://testnet.monadexplorer.com/address/0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1) |
| **Monad Explorer Contract** | [View on MonadVision / MonadExplorer ↗](https://testnet.monadvision.com/address/0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1) |
| **Network & Chain ID** | **Monad Testnet (Chain ID: `10143`)** |
| **Live Web Application** | `http://localhost:3001` *(or deployed production link)* |
| **Relayer Proxy Gateway** | `http://localhost:3000` (`/api/telemetry`, `/api/stats`, `/api/pair-device`) |
| **Standard Compliance** | **Gold Standard Water Benefit Certificate (1 m³ / 1,000 L saved = 1 $AQMON)** |

---

## 💡 The Problem & The Monad Solution

### The Real-World Crisis
* Rapid urban water depletion forces residential complexes to spend thousands of dollars monthly on commercial water tankers.
* Traditional water utilities lack real-time accountability: residents have zero incentive to conserve water, fix leaks, or monitor consumption.
* Corporate ESG & CSR mandates suffer from greenwashing and untraceable paper offsets.

### The AquaMon Solution on Monad
1. **IoT Edge Pulse Telemetry**: Low-cost ESP32 microcontrollers and LoRaWAN smart meters measure real-time flow rate per apartment.
2. **Zero-Gas Relayer Proxy**: The AquaMon Relayer batches and sponsors gas fees on Monad so residents pay **$0.00** when using their taps.
3. **High-Throughput Parallel Settlement**: Monad's 10,000 TPS and 400ms block times enable continuous IoT telemetry streaming across thousands of apartment units simultaneously.
4. **Anti-Exploit Daily Epoch Tokenomics**: Rewards are mathematically minted **only for water SAVED below the 200L daily baseline**. Midday exploitation is impossible because claims unlock after daily epoch finalization.
5. **Corporate ESG Retirement Engine**: Corporations buy and permanently burn `$AQMON` on-chain to offset their water footprint, receiving downloadable high-resolution audit certificates with immutable Monad transaction hashes.

---

## 🏗️ End-to-End System Architecture

```
┌────────────────────────────────┐
│   Physical Smart Water Meter   │  (ESP32 + Hall Effect Pulse Sensor / Wokwi)
│   (e.g., Unit 101, Apt 1A)     │  Measures flow pulses in real time (e.g. 0.45 L)
└───────────────┬────────────────┘
                │  HTTPS / Cryptographic Enclave Payload
                ▼
┌────────────────────────────────┐
│   AquaMon Relayer Proxy        │  • Maps Device ID ↔ Resident EVM Wallet
│   (Port 3000 Node.js Engine)   │  • Sponsors 100% Gas on Monad Parallel EVM
└───────────────┬────────────────┘
                │  recordTelemetry(residentWallet, litersScaled)
                ▼
┌────────────────────────────────┐
│   Monad Smart Contract         │  • Contract: AquaMonPool.sol (0xCce7...F9E1)
│   (Chain ID: 10143)            │  • Sub-800ms EVM execution
│                                │  • Tracks cumulative water & audits 200L quota
└───────────────┬────────────────┘
                │  getResidentStats() / claimTokens() / burn()
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          AquaMon Web Portal                              │
│                                                                          │
│  ┌───────────────────────────┐         ┌──────────────────────────────┐  │
│  │   Resident Dashboard      │         │   Corporate ESG Portal       │  │
│  │ • Water Saved Today Meter │         │ • Acquire $AQMON Offset Units│  │
│  │ • Daily 200L Quota Bar    │         │ • Irreversible On-Chain Burn │  │
│  │ • Epoch Claim Lifecycle   │         │ • Downloadable PNG/PDF Certs │  │
│  │ • HOA Bill Redemptions    │         │ • CSR Compliance Audits      │  │
│  └───────────────────────────┘         └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Tokenomics & Conservation Math

AquaMon conforms to the internationally recognized **Gold Standard Water Benefit Certificate** framework:

$$\text{Water Saved Today} = \max(0, \text{Daily Baseline (200 L)} - \text{Actual Liters Consumed})$$

$$\text{Reward Yield} = \frac{\text{Water Saved (Liters)}}{1,000} \times 1\text{ \$AQMON}$$

| Resident Behavior | Water Consumed | Water Saved | Daily \$AQMON Yield | Status |
|---|---|---|---|---|
| **Eco-Conscious Resident** | **45.00 L** | **+155.00 L Saved** | **+0.1550 \$AQMON** | 🟢 Quota Preserved (Top Yield) |
| **Moderate Resident** | **140.00 L** | **+60.00 L Saved** | **+0.0600 \$AQMON** | 🟢 Quota Preserved |
| **High Usage / Leak** | **235.00 L** | **0.00 L Saved** | **0.0000 \$AQMON** | 🔴 Quota Exceeded (Zero Yield) |

---

## 🚀 Step-by-Step Quickstart (For Anyone Running This Repo)

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/your-username/aquamon-monad.git
cd aquamon-monad

# Install dependencies across all packages
cd relayer && npm install && cd ..
cd frontend && npm install && cd ..
cd iot-simulator && npm install && cd ..
```

---

### 2. Start Core Services

```bash
# Terminal 1: Start AquaMon Gasless Relayer (Port 3000)
cd relayer
node server.js

# Terminal 2: Start Next.js Frontend (Port 3001)
cd frontend
npm run dev -- -p 3001
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 🧪 Demonstration Modes & Terminal Tools

You can demonstrate AquaMon in 3 distinct modes:

### 🔹 MODE 1: Interactive Wokwi Hardware + Terminal Listener (Recommended for Live Hardware Demos)
*Listen to real slider movements from Wokwi or a physical ESP32 board in real time:*

1. **Start the Passive Terminal Listener**:
   ```bash
   NODE_PATH=./relayer/node_modules node scripts/listen-hardware.js
   ```
2. **Open Wokwi**: [https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)
   - Paste code from `iot-hardware/sketch.ino`.
   - Paste diagram from `iot-hardware/diagram.json`.
   - Add library: `LiquidCrystal I2C`.
   - Click ▶️ **Play** and move the glider.
3. **Watch**: The terminal instantly outputs the confirmed Monad transaction hashes and your browser dashboard increments live!

---

### 🔹 MODE 2: Single-Resident 2-Minute Live Test Runner (Automated Zero-to-100 Demo)
*Streams continuous telemetry for your connected wallet and provides an audited on-chain summary:*

```bash
NODE_PATH=./relayer/node_modules node scripts/live-monitor.js <YOUR_EVM_WALLET_ADDRESS> 120
```
*(Example: `NODE_PATH=./relayer/node_modules node scripts/live-monitor.js 0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352 120`)*

---

### 🔹 MODE 3: Building-Wide Multi-Apartment Cluster Firehose (8 Units Streaming Concurrently)
*Simulates 8 distinct apartment units (`AQUAMON-UNIT-101` through `808`) in a residential complex streaming telemetry in parallel on Monad:*

```bash
cd iot-simulator
npm start
```
* **Watch in Browser**: Open the **Leaderboard Tab** at **[http://localhost:3001](http://localhost:3001)** to watch apartment rankings, building totals, and streaks recalculate in parallel every second!

---

## 📜 Smart Contract Specification (`AquaMonPool.sol`)

The `AquaMonPool.sol` smart contract is deployed and verified on Monad Testnet at address:
**[`0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1`](https://testnet.monadexplorer.com/address/0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1)**

### Core Functions:
1. **`recordTelemetry(address resident, uint256 litersScaled)`**:
   - Only callable by authorized AquaMon Relayer.
   - Updates resident cumulative water, increments daily usage, audits against 200L benchmark, and credits accrued `$AQMON` reward yield.
2. **`claimTokens()`**:
   - Callable by resident wallet.
   - Mints accrued `$AQMON` tokens into liquid ERC-20 balance in resident's wallet.
3. **`getResidentStats(address resident)`**:
   - Public view function returning total liters, current day liters, pending rewards (wei), total claimed, ping count, and current token balance.
4. **`transfer(address recipient, uint256 amount)`**:
   - Standard ERC-20 transfer enabling residents to donate tokens to verified NGO water conservation trusts or redeem HOA maintenance credits.

---

## 🎨 UI/UX Features

- **Anti-AI-Slop Minimalist Aesthetics**: Built using curated typography (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono`), warm off-white canvas (`#FBFBFA`), crisp borders, zero neon gradients, and zero drop shadows.
- **Strict Wallet-Gated Flow**: Visitors land on the clean **Protocol Landing Page**; connecting a wallet unlocks personal **Resident Dashboard**, **Building Leaderboard**, **Impact Fund**, and **Documentation**.
- **Instant Corporate ESG Certificate Generator**: Corporations can acquire credits and download a high-res `.png` or `.pdf` **Certificate of Water Benefit Retirement** with real Monad burn transaction hash verification.
- **Embedded Web3 Auth**: Powered by Para SDK v2 supporting Social OAuth (Google, Apple, Discord, Twitter, Phone) and external Web3 wallets (MetaMask, Coinbase, Rainbow).

---

## 📱 Hardware Implementation (`iot-hardware/`)

- **Microcontroller**: ESP32 NodeMCU / ESP8266 Wi-Fi module
- **Sensor**: YF-S201 Hall Effect Water Flow Pulse Sensor (450 pulses per Liter)
- **Firmware**: Arduino C++ (`sketch.ino`) with hardware cryptographic payload signing and Wi-Fi transmission.
- **Wiring Schematic**: Included in `iot-hardware/diagram.json` and `iot-hardware/readme.md`.

---

## 📢 Social & Pitch Links

- **Pitch Tagging**: Tagged on X / LinkedIn with `@monad`, `@monad_dev`, and `@geeky_kartikey`.
- **Live Video Demo**: 2-minute walkthrough demonstrating hardware pulse ingestion, Monad parallel execution, and on-chain token claiming.
- **License**: Released under the [MIT License](LICENSE).
