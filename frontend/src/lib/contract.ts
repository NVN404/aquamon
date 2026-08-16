export const JALPOOL_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xCce77B7F4b4D0628c4da66F7Aa9e2a78e598F9E1') as `0x${string}`;
export const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3000';
export const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';

export const JALPOOL_ABI = [
  {
    name: 'recordTelemetry',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resident', type: 'address' },
      { name: 'litersScaled', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'claimTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getResidentStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resident', type: 'address' }],
    outputs: [
      { name: 'totalLiters', type: 'uint256' },
      { name: 'currentDayLiters', type: 'uint256' },
      { name: 'pendingRewardsWei', type: 'uint256' },
      { name: 'totalClaimedWei', type: 'uint256' },
      { name: 'pingsLogged', type: 'uint256' },
      { name: 'aqmonBalanceWei', type: 'uint256' },
    ],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
