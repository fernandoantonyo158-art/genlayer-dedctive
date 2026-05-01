# Detective Badges NFT Deployment Instructions

## Overview
This guide will help you deploy the ERC-1155 Detective Badges smart contract to the GenLayer Testnet and integrate it with your frontend.

## Prerequisites
- Node.js installed
- MetaMask or compatible wallet
- GenLayer Testnet ETH for deployment
- Private key for deployment account

## 1. Setup Environment

### Install Dependencies
```bash
cd contracts
npm install
```

### Environment Variables
Create a `.env` file in the contracts directory:
```env
PRIVATE_KEY=your_private_key_here
GENLAYER_RPC_URL=https://testnet.genlayer.com
GENLAYER_API_KEY=your_api_key_here
```

## 2. Deploy to GenLayer Testnet

### Compile Contract
```bash
npm run compile
```

### Deploy Contract
```bash
npm run deploy:genlayer
```

### Verify Contract (Optional)
```bash
npm run verify --network genlayer <CONTRACT_ADDRESS>
```

## 3. Update Frontend Configuration

### Update Contract Address
After deployment, update the contract address in `constants/contracts.ts`:
```typescript
export const DETECTIVE_BADGES_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

## 4. Setup Metadata

### Host Metadata Files
1. Upload the images for both badges to a hosting service (IPFS recommended)
2. Update the `metadata/1.json` and `metadata/2.json` files with correct image URLs
3. Host the metadata files at a public URL

### Update Base URI
After deployment, call `setBaseURI()` with your metadata URL:
```bash
# Using Hardhat console
npx hardhat console --network genlayer
```

```javascript
const DetectiveBadges = await ethers.getContractFactory("DetectiveBadges");
const contract = DetectiveBadges.attach("0xYOUR_CONTRACT_ADDRESS");
await contract.setBaseURI("https://your-metadata-domain.com/api/metadata/");
```

## 5. Test the Integration

### Test Minting
1. Connect your wallet to the frontend
2. Navigate to Case 2 mint page
3. Click "MINT NFT BADGE" 
4. Confirm transaction in wallet
5. Verify NFT appears in wallet after successful mint

### Test Import Functionality
1. After successful mint, click "Add NFT to MetaMask"
2. Verify NFT appears in MetaMask NFT section
3. If automatic import fails, use manual import with provided contract address and token ID

## Contract Features

### Token IDs
- Token ID 1: Case 1 Badge (Free to mint)
- Token ID 2: Case 2 Badge (2.5 ETH to mint)

### Key Functions
- `mint(address to, uint256 tokenId, uint256 amount, bytes data)`: Mint badges
- `hasMintedBadge(address account, uint256 tokenId)`: Check if wallet has minted specific badge
- `getOwnedBadges(address account)`: Get all badge IDs owned by wallet
- `withdraw()`: Owner can withdraw collected ETH

### Security Features
- One badge per wallet per case (enforced by mapping)
- Reentrancy protection
- Only owner can withdraw funds
- Proper ERC-1155 compliance

## Troubleshooting

### Common Issues
1. **Contract not found**: Verify contract address is correct and deployed to correct network
2. **Metadata not showing**: Ensure base URI is set correctly and metadata files are accessible
3. **NFT not appearing in wallet**: Use manual import with contract address and token ID
4. **Transaction fails**: Check wallet has sufficient ETH for gas and mint price

### Support
- Check GenLayer Testnet documentation for network-specific issues
- Verify contract is properly verified on block explorer
- Ensure frontend is connected to correct network (Chain ID: 5134)

## Security Considerations
- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Consider implementing additional access controls if needed
