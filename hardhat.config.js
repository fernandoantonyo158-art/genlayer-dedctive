require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    genlayer: {
      url: process.env.GENLAYER_RPC_URL || "https://testnet.genlayer.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5134,
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      genlayer: process.env.GENLAYER_API_KEY
    },
    customChains: [
      {
        network: "genlayer",
        chainId: 5134,
        urls: {
          apiURL: "https://testnet-explorer.genlayer.com/api",
          browserURL: "https://testnet-explorer.genlayer.com"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
