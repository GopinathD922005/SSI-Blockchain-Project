import { ethers } from "ethers";
import fs from "fs";

async function main() {
  try {
    // ✅ Ethers v5 syntax
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");

    const privateKey = "0xfdebcc097c737f94ba0adfc04607f63a62ae9f6a74047d21dfc156fcffb72b70";

    const wallet = new ethers.Wallet(privateKey, provider);

    const artifact = JSON.parse(
      fs.readFileSync("./artifacts/contracts/SSI.sol/SSI.json")
    );

    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // 🚀 Deploy
    const contract = await factory.deploy();

    // ✅ Ethers v5 uses deployed()
    await contract.deployed();

    console.log("SSI Contract Deployed to:", contract.address);

  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main();
