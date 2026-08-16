# 🌉 Jal Protocol: Monad Web2-to-Web3 Relayer Proxy

The **Jal Relayer** is an API gateway that bridges hardware IoT smart water meters (or edge telemetry simulators) with the **Monad blockchain**.

## 🚀 Key Functions

1. **Telemetry Ingestion**: Listens on `POST /api/telemetry` for cryptographically signed water usage pings from smart meters.
2. **Device-to-Wallet Mapping**: Resolves meter device IDs (e.g. `JAL-METER-APT-1A`) to the resident's EVM wallet address (`0x1111...`).
3. **Gas Sponsorship**: Uses the Relayer operator wallet to pay Monad EVM gas fees so users never have to approve transactions for turning on their water tap.
4. **On-Chain Settlement**: Calls `recordTelemetry(residentAddress, litersScaled)` on `JalPool.sol` on Monad.
5. **Dashboard Data Provider**: Exposes `GET /api/stats` for real-time polling by the Next.js frontend UI.

---

## 🛠 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` or edit the existing file:
```env
PORT=3000
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRIVATE_KEY=your_relayer_private_key
CONTRACT_ADDRESS=your_deployed_jalpool_contract_address
```

### 3. Start the Relayer
```bash
npm start
# or development mode with file watching:
npm run dev
```

---

## 📡 API Reference

### Ingest Telemetry (`POST /api/telemetry`)
**Request Payload:**
```json
{
  "deviceId": "JAL-METER-APT-1A",
  "litersUsed": 1.45,
  "timestamp": 1692145892,
  "signature": "0x7f8b9c...",
  "status": "CONSERVING"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry anchored to Monad blockchain",
  "data": {
    "deviceId": "JAL-METER-APT-1A",
    "residentWallet": "0x1111111111111111111111111111111111111111",
    "litersUsed": 1.45,
    "txHash": "0x...",
    "isOnChain": true
  }
}
```

### Get Dashboard Statistics (`GET /api/stats`)
Returns aggregated liters tracked, active device counts, per-device breakdowns, and recent telemetry logs.

### Service Health (`GET /api/health`)
Returns Relayer server status and Monad RPC connection details.
