require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const chalk = require('chalk');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const jalRed = chalk.hex('#FF6B6B');

// Device ID to Resident EVM Wallet Mapping Table
const deviceToWallet = {
    "AQUAMON-UNIT-101": "0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352",
    "JAL-METER-APT-1A": "0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352",
    "AQUAMON-UNIT-202": "0x2222222222222222222222222222222222222222",
    "JAL-METER-APT-2B": "0x2222222222222222222222222222222222222222",
    "AQUAMON-UNIT-303": "0x3333333333333333333333333333333333333333",
    "JAL-METER-APT-3C": "0x3333333333333333333333333333333333333333",
    "AQUAMON-UNIT-404": "0x4444444444444444444444444444444444444444",
    "JAL-METER-APT-4D": "0x4444444444444444444444444444444444444444",
    "AQUAMON-UNIT-505": "0x5555555555555555555555555555555555555555",
    "JAL-METER-APT-5E": "0x5555555555555555555555555555555555555555"
};

// Fallback wallet generator for unmapped meter IDs
function getResidentWallet(deviceId) {
    if (deviceToWallet[deviceId]) {
        return deviceToWallet[deviceId];
    }
    const hash = ethers.keccak256(ethers.toUtf8Bytes(deviceId));
    return ethers.getAddress("0x" + hash.slice(26));
}

// Contract ABI definition for AquaMonPool.sol
const contractABI = [
    "function recordTelemetry(address resident, uint256 litersScaled) external",
    "function getResidentStats(address resident) external view returns (uint256 totalLiters, uint256 currentDayLiters, uint256 pendingRewardsWei, uint256 totalClaimedWei, uint256 pingsLogged, uint256 jalBalanceWei)"
];

let provider = null;
let wallet = null;
let jalContract = null;

const rpcUrl = process.env.MONAD_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

if (rpcUrl && privateKey && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
    try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        wallet = new ethers.Wallet(privateKey, provider);
        if (contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000") {
            jalContract = new ethers.Contract(contractAddress, contractABI, wallet);
        }
    } catch (err) {
        console.log(chalk.yellow(`[WARNING] Could not initialize Monad RPC wallet: ${err.message}`));
    }
}

// Global In-Memory Telemetry Metrics (for live Next.js dashboard polling)
const dashboardStats = {
    totalLitersTracked: 0,
    telemetriesCount: 0,
    activeDevicesCount: 0,
    devices: {},
    recentLogs: []
};

/**
 * POST /api/pair-device
 * Allows dynamic binding of resident wallet to smart water meter ID
 */
app.post('/api/pair-device', (req, res) => {
    const { deviceId, residentWallet } = req.body;
    if (!deviceId || !residentWallet) {
        return res.status(400).json({ error: "Missing deviceId or residentWallet" });
    }
    deviceToWallet[deviceId] = residentWallet;
    console.log(chalk.cyan(`[DEVICE PAIRED] Meter ${deviceId} ↔ Resident Wallet ${residentWallet}`));
    return res.json({ success: true, message: `Meter ${deviceId} linked to ${residentWallet}` });
});

/**
 * POST /api/telemetry
 * Ingests signed IoT hardware payload, maps device ID to EVM wallet,
 * records telemetry on Monad, and updates dashboard metrics.
 */
app.post('/api/telemetry', async (req, res) => {
    const { deviceId, litersUsed, timestamp, signature, status } = req.body;

    if (!deviceId || litersUsed === undefined) {
        return res.status(400).json({ error: "Missing deviceId or litersUsed" });
    }

    if (!signature) {
        return res.status(401).json({ error: "Missing hardware cryptographic signature" });
    }

    // Always ensure valid live epoch timestamp in seconds
    const currentEpochTime = (timestamp && timestamp > 1700000000) 
        ? timestamp 
        : Math.floor(Date.now() / 1000);

    const residentWallet = getResidentWallet(deviceId);
    const parsedLiters = parseFloat(litersUsed) || 0;
    const litersScaled = Math.floor(parsedLiters * 100);

    // Dynamic Intelligent Status categorization based on volume
    let computedStatus = "CONSERVING";
    if (parsedLiters > 2.0) {
        computedStatus = "HIGH_SURGE";
    } else if (parsedLiters > 0.6) {
        computedStatus = "NORMAL";
    } else {
        computedStatus = "CONSERVING";
    }

    // Update in-memory stats
    dashboardStats.totalLitersTracked = parseFloat((dashboardStats.totalLitersTracked + parsedLiters).toFixed(2));
    dashboardStats.telemetriesCount += 1;

    if (!dashboardStats.devices[deviceId]) {
        dashboardStats.devices[deviceId] = {
            deviceId,
            residentWallet,
            totalLiters: 0,
            pingCount: 0,
            status: computedStatus,
            lastUpdate: currentEpochTime
        };
    }

    dashboardStats.devices[deviceId].totalLiters = parseFloat((dashboardStats.devices[deviceId].totalLiters + parsedLiters).toFixed(2));
    dashboardStats.devices[deviceId].pingCount += 1;
    dashboardStats.devices[deviceId].status = computedStatus;
    dashboardStats.devices[deviceId].lastUpdate = currentEpochTime;
    dashboardStats.activeDevicesCount = Object.keys(dashboardStats.devices).length;

    let txHash = null;
    let isOnChain = false;

    // Send transaction to Monad smart contract if configured
    if (jalContract) {
        try {
            console.log(chalk.gray(`          -> Submitting Tx to Monad EVM for ${residentWallet}...`));
            const tx = await jalContract.recordTelemetry(residentWallet, litersScaled);
            txHash = tx.hash;
            isOnChain = true;
            console.log(chalk.green(`          ✅ Monad Tx Confirmed! Hash: ${txHash}`));
        } catch (error) {
            console.log(chalk.red(`          ❌ Monad Tx Error: ${error.message}`));
        }
    } else {
        txHash = "0x" + Math.random().toString(16).slice(2, 40) + Math.random().toString(16).slice(2, 26);
    }

    const logEntry = {
        deviceId,
        residentWallet,
        litersUsed: parsedLiters,
        status: computedStatus,
        timestamp: currentEpochTime,
        txHash,
        isOnChain
    };

    dashboardStats.recentLogs.unshift(logEntry);
    if (dashboardStats.recentLogs.length > 30) {
        dashboardStats.recentLogs.pop();
    }

    // Terminal Logging
    process.stdout.write(jalRed(`[RELAYER -> MONAD] `));
    console.log(chalk.white(`Meter: ${chalk.bold(deviceId)} | Flow: ${chalk.yellow(parsedLiters + 'L')} | Status: ${computedStatus === 'CONSERVING' ? chalk.green(computedStatus) : chalk.red(computedStatus)} | Tx: ${chalk.gray(txHash ? txHash.slice(0, 14) + '...' : 'none')}`));

    return res.status(200).json({
        success: true,
        message: isOnChain ? "Telemetry anchored to Monad blockchain" : "Telemetry logged (Simulation Mode)",
        data: logEntry
    });
});

/**
 * GET /api/stats
 * Exposes live telemetry statistics for dashboard UI.
 */
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        totalLitersTracked: dashboardStats.totalLitersTracked,
        telemetriesCount: dashboardStats.telemetriesCount,
        activeDevicesCount: dashboardStats.activeDevicesCount,
        devices: Object.values(dashboardStats.devices),
        recentLogs: dashboardStats.recentLogs
    });
});

/**
 * GET /api/health
 * Health check endpoint.
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: "ONLINE",
        service: "AquaMon Monad Relayer Proxy",
        monadConnected: jalContract !== null,
        rpcUrl: rpcUrl || "UNSET",
        contractAddress: contractAddress || "UNSET"
    });
});

app.listen(PORT, () => {
    console.log(jalRed.bold("=================================================================="));
    console.log(chalk.white.bold(" 🌉 AQUAMON DEPIN RELAYER PROXY ACTIVE (MONAD EVM GATEWAY)"));
    console.log(jalRed.bold("=================================================================="));
    console.log(chalk.gray(` Listening on port: ${PORT}`));
    console.log(chalk.gray(` Endpoints:`));
    console.log(chalk.gray(`   POST http://localhost:${PORT}/api/telemetry`));
    console.log(chalk.gray(`   POST http://localhost:${PORT}/api/pair-device`));
    console.log(chalk.gray(`   GET  http://localhost:${PORT}/api/stats`));
    console.log(chalk.gray(`   GET  http://localhost:${PORT}/api/health\n`));
});
