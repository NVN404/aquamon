require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3000/api/telemetry';
const PING_INTERVAL_MS = parseInt(process.env.PING_INTERVAL_MS) || 2500;
const monadBlue = chalk.hex('#5B5BF7');

const devices = [
    { id: "AQUAMON-UNIT-101", baseFlow: 0.15, status: "CONSERVING" },
    { id: "AQUAMON-UNIT-202", baseFlow: 0.35, status: "NORMAL" },
    { id: "AQUAMON-UNIT-303", baseFlow: 1.20, status: "LEAK_DETECTED" },
    { id: "AQUAMON-UNIT-404", baseFlow: 0.00, status: "IDLE" },
    { id: "AQUAMON-UNIT-505", baseFlow: 0.25, status: "CONSERVING" },
    { id: "AQUAMON-UNIT-606", baseFlow: 0.40, status: "NORMAL" },
    { id: "AQUAMON-UNIT-707", baseFlow: 0.10, status: "CONSERVING" },
    { id: "AQUAMON-UNIT-808", baseFlow: 0.30, status: "NORMAL" }
];

console.log(monadBlue.bold("=================================================================="));
console.log(chalk.white.bold(" 🌊 AQUAMON DePIN HARDWARE TELEMETRY FIREHOSE (MONAD SIMULATOR)"));
console.log(monadBlue.bold("=================================================================="));
console.log(chalk.gray(` Target Relayer Proxy: ${RELAYER_URL}`));
console.log(chalk.gray(` Ping Rate: Every ${PING_INTERVAL_MS}ms across simulated meters\n`));

setInterval(async () => {
    const activeDevice = devices[Math.floor(Math.random() * devices.length)];
    const currentFlowLiters = parseFloat((activeDevice.baseFlow + (Math.random() * 0.15)).toFixed(2));
    const mockSignature = "0x" + Math.random().toString(16).slice(2, 40).padEnd(64, '0');
    
    const payload = {
        deviceId: activeDevice.id,
        litersUsed: currentFlowLiters,
        timestamp: Math.floor(Date.now() / 1000),
        signature: mockSignature,
        status: activeDevice.status
    };

    try {
        const response = await axios.post(RELAYER_URL, payload);
        const data = response.data.data || {};
        
        process.stdout.write(monadBlue(`[TELEMETRY TX ->] `));
        console.log(chalk.white(`Device: ${chalk.bold(payload.deviceId)} | Flow: ${chalk.yellow(payload.litersUsed + 'L')} | Resident: ${chalk.cyan((data.residentWallet || '').slice(0, 8) + '...')} | Status: ${chalk.green(payload.status)}`));
    } catch (error) {
        console.log(chalk.bgRed.white(`[CONNECT ERROR] Failed to reach relayer at ${RELAYER_URL} `));
    }
}, PING_INTERVAL_MS);
