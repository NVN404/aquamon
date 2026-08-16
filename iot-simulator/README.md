# 🌊 Jal Protocol: High-Throughput IoT Telemetry Simulator

This directory contains the Node.js telemetry firehose simulator designed to stress-test the **Monad Relayer** and parallel EVM smart contract pipeline.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Ignite the Firehose
```bash
npm start
```

It will continuously fire signed water meter telemetry pings across multiple apartment meter IDs to `http://localhost:3000/api/telemetry`.
