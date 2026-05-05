import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com";
const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    mumbai: {
      url: POLYGON_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 80001,
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
