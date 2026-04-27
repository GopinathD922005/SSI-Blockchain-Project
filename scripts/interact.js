import { ethers } from "ethers";
import fs from "fs";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const wallet = new ethers.Wallet(privateKey, provider);

  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/SSI.sol/SSI.json", "utf8")
  );

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    artifact.abi,
    wallet
  );

  // 🔥 Create Identity
  const tx = await contract.createIdentity("did:example:12345");
  await tx.wait();

  console.log("✅ Identity Created!");

  // 🔥 Get Identity
  const identity = await contract.getIdentity(wallet.address);

  console.log("📌 Stored Identity:", identity);
}

main().catch(console.error);