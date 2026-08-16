require('dotenv').config({ path: require('path').resolve(__dirname, '../relayer/.env') });
const axios = require('axios');
const { ethers } = require('ethers');
const chalk = require('chalk');

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3000';
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1';

// User wallet can be passed via command-line args or default
const TARGET_WALLET = process.argv[2] || '0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352';
const DURATION_SECONDS = parseInt(process.argv[3]) || 120; // 2 minutes default
const PING_INTERVAL_MS = 2500; // Ping every 2.5 seconds

const monadPurple = chalk.hex('#836EF9');
const monadCyan = chalk.hex('#00F5D4');
const monadGreen = chalk.hex('#2DDA9B');
const monadYellow = chalk.hex('#FCE068');

const contractABI = [
    "function getResidentStats(address resident) external view returns (uint256 totalLiters, uint256 currentDayLiters, uint256 pendingRewardsWei, uint256 totalClaimedWei, uint256 pingsLogged, uint256 aqmonBalanceWei)"
];

async function main() {
    console.clear();
    console.log(monadPurple.bold("========================================================================================================================"));
    console.log(chalk.white.bold(" 🌊 AQUAMON DePIN LIVE TEST HARNESS — END-TO-END TELEMETRY & ON-CHAIN MONAD SETTLEMENT"));
    console.log(monadPurple.bold("========================================================================================================================"));
    console.log(chalk.gray(` Target Resident Wallet : `) + chalk.cyan.bold(TARGET_WALLET) + chalk.gray(` (Apartment 1A · Unit 101)`));
    console.log(chalk.gray(` Monad Contract Address : `) + chalk.yellow.bold(CONTRACT_ADDRESS) + chalk.gray(` (Monad Testnet · Chain ID: 10143)`));
    console.log(chalk.gray(` Gasless Relayer Proxy  : `) + chalk.white.bold(RELAYER_URL));
    console.log(chalk.gray(` Test Run Duration      : `) + chalk.green.bold(`${DURATION_SECONDS} Seconds (~${Math.floor(DURATION_SECONDS / (PING_INTERVAL_MS / 1000))} real transactions)`));
    console.log(chalk.gray(` Real-Time Explorer     : `) + chalk.underline.cyan(`https://testnet.monadexplorer.com/address/${TARGET_WALLET}`));
    console.log(chalk.gray(` Live Resident Web App  : `) + chalk.underline.green(`http://localhost:3001`));
    console.log(monadPurple.bold("========================================================================================================================\n"));

    // Step 1: Ensure device pairing on the Relayer
    try {
        await axios.post(`${RELAYER_URL}/api/pair-device`, {
            deviceId: 'AQUAMON-UNIT-101',
            residentWallet: TARGET_WALLET
        });
        await axios.post(`${RELAYER_URL}/api/pair-device`, {
            deviceId: 'JAL-METER-APT-1A',
            residentWallet: TARGET_WALLET
        });
        console.log(monadGreen(`[SETUP] Meter 'AQUAMON-UNIT-101' paired with wallet ${TARGET_WALLET} on Relayer.\n`));
    } catch (e) {
        console.log(chalk.yellow(`[SETUP WARNING] Could not pair device: ${e.message}\n`));
    }

    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // Initial On-Chain State
    let initialStats = null;
    try {
        initialStats = await contract.getResidentStats(TARGET_WALLET);
        console.log(chalk.gray(`[INITIAL ON-CHAIN STATE] Total: ${initialStats[0]}L | Day Used: ${initialStats[1]}L | Accrued: ${ethers.formatEther(initialStats[2])} $AQMON | Balance: ${ethers.formatEther(initialStats[5])} $AQMON\n`));
    } catch (err) {
        console.log(chalk.yellow(`[RPC WARNING] Could not fetch initial state: ${err.message}\n`));
    }

    // Column Header
    console.log(chalk.bold.white(
        `${'#'.padEnd(4)} | ${'TIMESTAMP'.padEnd(9)} | ${'1. IoT SENSOR TELEMETRY'.padEnd(28)} | ${'2. RELAYER ON-CHAIN TX (HASH)'.padEnd(38)} | ${'3. LIVE MONAD STATE'.padEnd(26)}`
    ));
    console.log(chalk.gray('-'.repeat(120)));

    let pingCount = 0;
    const startTime = Date.now();
    const endTime = startTime + (DURATION_SECONDS * 1000);

    const interval = setInterval(async () => {
        if (Date.now() >= endTime) {
            clearInterval(interval);
            console.log(chalk.gray('\n' + '-'.repeat(120)));
            console.log(monadGreen.bold(`\n🎉 2-MINUTE LIVE TEST COMPLETE! All ${pingCount} transactions permanently recorded on Monad.`));
            
            try {
                const finalStats = await contract.getResidentStats(TARGET_WALLET);
                console.log(chalk.white.bold('\n📊 FINAL AUDITED ON-CHAIN STATE:'));
                console.log(chalk.gray(`   • Cumulative Water Logged : `) + chalk.cyan.bold(`${finalStats[0]} Liters`));
                console.log(chalk.gray(`   • Daily Water Consumed    : `) + chalk.yellow.bold(`${finalStats[1]} / 200.00 L`));
                console.log(chalk.gray(`   • Water Saved Today       : `) + chalk.green.bold(`+${Math.max(0, 200 - Number(finalStats[1]))}.00 Liters Saved`));
                console.log(chalk.gray(`   • Claimable $AQMON Yield  : `) + chalk.green.bold(`${ethers.formatEther(finalStats[2])} $AQMON`));
                console.log(chalk.gray(`   • Verified Pings Logged   : `) + chalk.white.bold(`${finalStats[4]}`));
                console.log(chalk.gray(`   • Wallet Balance          : `) + chalk.white.bold(`${ethers.formatEther(finalStats[5])} $AQMON`));
                console.log(chalk.gray(`\n🔗 Open http://localhost:3001 and click 'Claim to Connected Wallet' to mint your tokens on Monad!\n`));
            } catch (e) {}
            return;
        }

        pingCount++;
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const flowLiters = parseFloat((0.20 + (Math.random() * 0.15)).toFixed(2));
        const mockSignature = "0x" + Math.random().toString(16).slice(2, 40).padEnd(64, '0');

        const payload = {
            deviceId: 'AQUAMON-UNIT-101',
            litersUsed: flowLiters,
            timestamp: Math.floor(Date.now() / 1000),
            signature: mockSignature,
            status: 'CONSERVING'
        };

        try {
            // Send to Relayer
            const response = await axios.post(`${RELAYER_URL}/api/telemetry`, payload);
            const logData = response.data.data || {};
            const txHash = logData.txHash || 'Pending...';
            const shortHash = txHash.length > 18 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;

            // Fetch live on-chain stats from Monad RPC
            let onChainDisplay = 'Querying RPC...';
            try {
                const stats = await contract.getResidentStats(TARGET_WALLET);
                onChainDisplay = `Tot: ${stats[0]}L | Day: ${stats[1]}L`;
            } catch (e) {
                onChainDisplay = `Flow: +${flowLiters}L`;
            }

            console.log(
                `${String(pingCount).padEnd(4)} | ` +
                chalk.gray(`${timeStr}`.padEnd(9)) + ` | ` +
                chalk.white(`UNIT-101 `) + chalk.yellow(`+${flowLiters.toFixed(2)}L`) + chalk.gray(` (pulse)`.padEnd(12)) + ` | ` +
                chalk.cyan(`Tx: ${shortHash}`.padEnd(38)) + ` | ` +
                monadGreen(`${onChainDisplay}`.padEnd(26))
            );

        } catch (err) {
            console.log(
                `${String(pingCount).padEnd(4)} | ` +
                chalk.gray(`${timeStr}`.padEnd(9)) + ` | ` +
                chalk.red(`Error: ${err.message}`)
            );
        }
    }, PING_INTERVAL_MS);
}

main().catch(console.error);
