require('dotenv').config();
const { ethers } = require('ethers');
const chalk = require('chalk');

const jalRed = chalk.hex('#FF6B6B');

const contractABI = [
    "function recordTelemetry(address resident, uint256 litersScaled) external",
    "function getResidentStats(address resident) external view returns (uint256 totalLiters, uint256 currentDayLiters, uint256 pendingRewardsWei, uint256 totalClaimedWei, uint256 pingsLogged, uint256 jalBalanceWei)",
    "function getNetworkStats() external view returns (uint256 totalNetworkLiters, uint256 totalPings, uint256 totalJalMinted)"
];

async function verifyOnChain() {
    console.log(jalRed.bold("=================================================================="));
    console.log(chalk.white.bold(" 🔎 VERIFYING LIVE ON-CHAIN STATE ON MONAD TESTNET"));
    console.log(jalRed.bold("=================================================================="));

    const rpcUrl = process.env.MONAD_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    console.log(chalk.gray(` Contract Address: ${contractAddress}`));
    console.log(chalk.gray(` Monad RPC:        ${rpcUrl}`));

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const jalContract = new ethers.Contract(contractAddress, contractABI, wallet);

    const testResident = "0x1111111111111111111111111111111111111111"; // JAL-METER-APT-1A
    const testLiters = 1.45;
    const litersScaled = Math.floor(testLiters * 100); // 145

    console.log(chalk.yellow(`\n 📡 1. Submitting Telemetry Ping to Monad Contract...`));
    console.log(chalk.gray(`    Resident Wallet: ${testResident}`));
    console.log(chalk.gray(`    Flow Volume:     ${testLiters} Liters (${litersScaled} scaled units)`));

    const tx = await jalContract.recordTelemetry(testResident, litersScaled);
    console.log(chalk.cyan(`    Tx Sent! Hash:   ${tx.hash}`));
    console.log(chalk.gray(`    Waiting for Monad block confirmation...`));

    await tx.wait();
    console.log(chalk.green(`    ✅ Transaction Confirmed on Monad Block!`));

    console.log(chalk.yellow(`\n 📊 2. Querying On-Chain State from Smart Contract...`));
    const stats = await jalContract.getResidentStats(testResident);

    console.log(jalRed.bold("\n=================================================================="));
    console.log(chalk.white.bold(" 🌟 ON-CHAIN STATE VERIFIED SUCCESSFUL!"));
    console.log(jalRed.bold("=================================================================="));
    console.log(chalk.white(` Resident Total Liters Logged: `) + chalk.green(`${stats[0]} Liters`));
    console.log(chalk.white(` Resident Pings Logged:        `) + chalk.green(`${stats[4]} Pings`));
    console.log(chalk.white(` Pending $JAL Rewards Accrued: `) + chalk.green(`${ethers.formatEther(stats[2])} $JAL`));
    console.log(jalRed.bold("==================================================================\n"));
    console.log(chalk.blue(` Monad Explorer Tx Link: https://testnet.monadexplorer.com/tx/${tx.hash}`));
}

verifyOnChain().catch((err) => {
    console.error(chalk.red("Verification Failed:"), err);
});

