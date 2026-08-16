const fs = require('fs');
const path = require('path');
const solc = require('solc');
const axios = require('axios');
const FormData = require('form-data');
const chalk = require('chalk');

async function verifyScript() {
    const contractAddress = "0xBB62bFe298Bf8Fc44C4f4b14c814f4d5A6953Dff";
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
                    '*': ['abi', 'evm.bytecode', 'metadata'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const metadataString = output.contracts['JalPool.sol']['JalPool'].metadata;
    const metadataPath = path.resolve(__dirname, 'metadata.json');
    fs.writeFileSync(metadataPath, metadataString);

    const form = new FormData();
    form.append('address', contractAddress);
    form.append('chain', '10143');
    form.append('files', fs.createReadStream(contractPath), 'JalPool.sol');
    form.append('files', fs.createReadStream(metadataPath), 'metadata.json');

    try {
        const res = await axios.post('https://sourcify-api-monad.blockvision.org/verify', form, {
            headers: form.getHeaders(),
        });
        console.log(chalk.green(" ✅ Verification Successful on MonadVision:"), res.data);
    } catch (err) {
        console.log(chalk.yellow(" Result:"), err.response ? err.response.data : err.message);
    } finally {
        if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
    }
}

verifyScript();
