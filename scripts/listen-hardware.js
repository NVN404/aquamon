require('dotenv').config({ path: require('path').resolve(__dirname, '../relayer/.env') });
const axios = require('axios');
const { ethers } = require('ethers');
const chalk = require('chalk');

const RELAYER_URL = process.env.RELAYER_URL || 'http://localhost:3000';
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1';
const TARGET_WALLET = process.argv[2] || '0xC4c0499851Bb8e413BBa83fEdD93b485ca26b352';

const monadPurple = chalk.hex('#836EF9');
const monadCyan = chalk.hex('#00F5D4');
const monadGreen = chalk.hex('#2DDA9B');

const contractABI = [
    "function getResidentStats(address resident) external view returns (uint256 totalLiters, uint256 currentDayLiters, uint256 pendingRewardsWei, uint256 totalClaimedWei, uint256 pingsLogged, uint256 aqmonBalanceWei)"
];

async function main() {
    console.clear();
    console.log(monadPurple.bold("========================================================================================================================"));
    console.log(chalk.white.bold(" 📡 AQUAMON HARDWARE & RELAYER LIVE ON-CHAIN STREAM LISTENER"));
    console.log(monadPurple.bold("========================================================================================================================"));
    console.log(chalk.gray(` Target Resident Wallet : `) + chalk.cyan.bold(TARGET_WALLET) + chalk.gray(` (Apartment 1A · Unit 101)`));
    console.log(chalk.gray(` Monad Contract Address : `) + chalk.yellow.bold(CONTRACT_ADDRESS) + chalk.gray(` (Chain ID: 10143)`));
    console.log(chalk.gray(` Mode                   : `) + chalk.green.bold(`PASSIVE STREAM (Waiting for live incoming Wokwi / Hardware packets...)`));
    console.log(chalk.gray(` Real-Time Explorer     : `) + chalk.underline.cyan(`https://testnet.monadexplorer.com/address/${TARGET_WALLET}`));
    console.log(chalk.gray(` Live Resident Web App  : `) + chalk.underline.green(`http://localhost:3001`));
    console.log(monadPurple.bold("========================================================================================================================\n"));

    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    console.log(chalk.bold.white(
        `${'TIME (IST)'.padEnd(12)} | ${'HARDWARE IoT SIGNAL'.padEnd(30)} | ${'CONFIRMED MONAD TX HASH'.padEnd(46)} | ${'ON-CHAIN STATE'}`
    ));
    console.log(chalk.gray('-'.repeat(120)));

    // Track starting timestamp so we ignore past historical transactions
    const listenerStartTime = Math.floor(Date.now() / 1000) - 2;
    let seenTxHashes = new Set();

    // Poll the Relayer ONLY for new packets arriving AFTER this listener started
    setInterval(async () => {
        try {
            const res = await axios.get(`${RELAYER_URL}/api/stats`);
            const logs = res.data.recentLogs || [];

            for (let i = logs.length - 1; i >= 0; i--) {
                const log = logs[i];
                // Only process logs that arrived AFTER listener started
                if (log.txHash && !seenTxHashes.has(log.txHash) && log.timestamp >= listenerStartTime) {
                    seenTxHashes.add(log.txHash);

                    const date = new Date(log.timestamp > 1000000000000 ? log.timestamp : log.timestamp * 1000);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    const statusTag = log.status === 'CONSERVING' ? chalk.green('CONSERVING') : chalk.red(log.status || 'NORMAL');

                    let onChainInfo = 'Audited';
                    try {
                        const stats = await contract.getResidentStats(TARGET_WALLET);
                        onChainInfo = `Day: ${stats[1]}L | Pings: ${stats[4]}`;
                    } catch (e) {}

                    console.log(
                        chalk.gray(`${timeStr}`.padEnd(12)) + ` | ` +
                        chalk.white(`${log.deviceId} `) + chalk.yellow(`+${log.litersUsed}L `) + `[${statusTag}]`.padEnd(20) + ` | ` +
                        chalk.cyan(`Tx: ${log.txHash.slice(0, 16)}...${log.txHash.slice(-6)}`.padEnd(46)) + ` | ` +
                        monadGreen(onChainInfo)
                    );
                }
            }
        } catch (e) {}
    }, 1000);
}

main().catch(console.error);
