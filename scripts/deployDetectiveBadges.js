const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DetectiveBadges contract...");
  
  // Base URI for metadata (update with your actual metadata location)
  const baseTokenURI = "https://your-metadata-domain.com/api/metadata/";
  
  // Get the contract factory
  const DetectiveBadges = await ethers.getContractFactory("DetectiveBadges");
  
  // Deploy the contract
  const detectiveBadges = await DetectiveBadges.deploy(baseTokenURI);
  
  await detectiveBadges.deployed();
  
  console.log("DetectiveBadges deployed to:", detectiveBadges.address);
  console.log("Transaction hash:", detectiveBadges.deployTransaction.hash);
  
  // Log deployment details
  console.log("\n=== Deployment Details ===");
  console.log("Contract Address:", detectiveBadges.address);
  console.log("Base URI:", baseTokenURI);
  console.log("Owner:", await detectiveBadges.owner());
  
  // Verify the contract works by checking token IDs
  console.log("\n=== Token IDs ===");
  console.log("Case 1 Badge ID:", await detectiveBadges.CASE_1_BADGE());
  console.log("Case 2 Badge ID:", await detectiveBadges.CASE_2_BADGE());
  console.log("Mint Price:", ethers.utils.formatEther(await detectiveBadges.MINT_PRICE()), "ETH");
  
  // Save contract address to a file for frontend use
  const fs = require("fs");
  const contractInfo = {
    address: detectiveBadges.address,
    abi: require("../artifacts/contracts/DetectiveBadges.sol/DetectiveBadges.json").abi,
    deployment: {
      network: network.name,
      transactionHash: detectiveBadges.deployTransaction.hash,
      blockNumber: detectiveBadges.deployTransaction.blockNumber,
      gasUsed: detectiveBadges.deployTransaction.gasLimit.toString()
    }
  };
  
  fs.writeFileSync(
    "./frontend/contract-info.json", 
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("\nContract info saved to ./frontend/contract-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
