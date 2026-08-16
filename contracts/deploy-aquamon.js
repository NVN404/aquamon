const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.resolve(__dirname, '../relayer/.env') });

async function main() {
    console.log("Compiling AquaMonPool.sol...");
    const contractPath = path.resolve(__dirname, 'AquaMonPool.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'AquaMonPool.sol': { content: source }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error("Compilation errors:", errors);
            process.exit(1);
        }
    }

    const contractFile = output.contracts['AquaMonPool.sol']['AquaMonPool'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log("Connecting to Monad Testnet RPC:", process.env.MONAD_RPC_URL);
    const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Deployer Wallet:", wallet.address);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log("Deploying AquaMonPool contract (Relayer address set to deployer)...");
    const contract = await factory.deploy(wallet.address);
    console.log("Deploy Tx Hash:", contract.deploymentTransaction().hash);

    await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();
    console.log("\n=======================================================");
    console.log("🎉 AquaMonPool ($AQMON) DEPLOYED SUCCESSFULLY TO MONAD!");
    console.log("Contract Address:", deployedAddress);
    console.log("Token Name:", await contract.name());
    console.log("Token Symbol:", await contract.symbol());
    console.log("=======================================================\n");

    // Output for easy copy
    fs.writeFileSync(path.resolve(__dirname, 'latest_deployment.json'), JSON.stringify({
        address: deployedAddress,
        abi: abi,
        deployedAt: new Date().toISOString()
    }, null, 2));
}

main().catch(console.error);
