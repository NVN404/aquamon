require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
const chalk = require('chalk');

const jalRed = chalk.hex('#FF6B6B');

async function deploy() {
    console.log(jalRed.bold("=================================================================="));
    console.log(chalk.white.bold(" 🚀 DEPLOYING JALPOOL CONTRACT TO MONAD TESTNET"));
    console.log(jalRed.bold("=================================================================="));

    const contractPath = path.resolve(__dirname, '../contracts/JalPool.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'JalPool.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode'],
                },
            },
        },
    };

    console.log(chalk.gray(' Compiling JalPool.sol...'));
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error(chalk.red('Compilation Errors:'), errors);
            process.exit(1);
        }
    }

    const contractFile = output.contracts['JalPool.sol']['JalPool'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log(chalk.green(' ✅ Compilation Successful!'));

    const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey || privateKey.includes('0000000000000000000000000000000000000001')) {
        console.error(chalk.red(' ❌ Invalid PRIVATE_KEY in relayer/.env'));
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(chalk.cyan(` Deployer Wallet Address: ${wallet.address}`));
    const balance = await provider.getBalance(wallet.address);
    console.log(chalk.yellow(` Wallet MON Balance: ${ethers.formatEther(balance)} MON`));

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    console.log(chalk.gray(' Submitting deployment transaction to Monad Testnet...'));
    const contract = await factory.deploy(wallet.address);
    
    console.log(chalk.yellow(` Tx Sent! Hash: ${contract.deploymentTransaction().hash}`));
    console.log(chalk.gray(' Waiting for block confirmation...'));

    await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();

    console.log(jalRed.bold("\n=================================================================="));
    console.log(chalk.green.bold(` 🎉 SUCCESS! JalPool Deployed to Monad Testnet!`));
    console.log(chalk.white.bold(` Contract Address: ${deployedAddress}`));
    console.log(jalRed.bold("==================================================================\n"));

    // Automatically update relayer/.env
    const envPath = path.resolve(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${deployedAddress}`);
    fs.writeFileSync(envPath, envContent);

    console.log(chalk.green(` Updated relayer/.env with CONTRACT_ADDRESS=${deployedAddress}\n`));
}

deploy().catch((err) => {
    console.error(chalk.red('Deployment Failed:'), err);
    process.exit(1);
});
