import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [hardhatEthers],

  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris"
    }
  },

  networks: {
    ganache: {
      type: "http",   // ✅ THIS FIXES YOUR ERROR
      url: "http://127.0.0.1:7545",
      chainId: 1337
    }
  }
});