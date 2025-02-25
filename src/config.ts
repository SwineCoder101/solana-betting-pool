import { Cluster, ClusterNetwork } from './components/cluster/cluster-data-access'
import { BettingChartSize } from './types'

export const PADDING = 0.005 // 0.5% padding between rows

export const TICK_POSITIONS = {
  sm: [0, 5],
  md: [0, 5, 10],
  lg: [0, 5, 10, 15],
}

export const SECONDS_PER_CELL_BLOCK = 30

export const DEVNET_CLUSTER: Cluster = {
  name: 'Devnet',
  endpoint: 'https://api.devnet.solana.com',
  network: ClusterNetwork.Devnet,
}

export const CLUSTER_TO_USE = DEVNET_CLUSTER;

// Define size configurations
export const CHART_CONFIGS = {
  [BettingChartSize.DESKTOP_COMPACT]: {
    cols: 8,
    rows: 4,
    width: 1500,
    height: 1000,
  },
  [BettingChartSize.DESKTOP_EXPANDED]: {
    cols: 8,
    rows: 10,
    width: 1500,
    height: 1000,
  },
  [BettingChartSize.MOBILE_COMPACT]: {
    cols: 4,
    rows: 4,
    width: 300,
    height: 400,
  },
  [BettingChartSize.MOBILE_EXPANDED]: {
    cols: 8,
    rows: 10,
    width: 300,
    height: 400,
  },
}

export const MULTIPLIER_CONFIG = {
  BASE: 1.1, // Middle row multiplier
  INCREMENT: 0.1, // How much to add for each row away from middle
  FORMAT_DECIMALS: 1, // Number of decimal places to show
} as const

// Optional: You can also add preset configurations
export const MULTIPLIER_PRESETS = {
  DEFAULT: {
    BASE: 1.1,
    INCREMENT: 0.1,
    // Results in: 1.1x, 1.2x, 1.3x, 1.4x, 1.5x
  },
  AGGRESSIVE: {
    BASE: 1.2,
    INCREMENT: 0.2,
    // Results in: 1.2x, 1.4x, 1.6x, 1.8x, 2.0x
  },
  CONSERVATIVE: {
    BASE: 1.05,
    INCREMENT: 0.05,
    // Results in: 1.05x, 1.10x, 1.15x, 1.20x, 1.25x
  },
} as const

export const ADMIN_ADDRESSES : string[] = [
  'GJwvBRbBZwNYzJEECfCEjKqkDf9YfKzYKwqEEmyKRYHF', // Example admin address
  'BKPMTGPrLXDdrHBQSBhH33dqPNDtyTcuMh8BG9Ce1aa',  // Example admin address
  '6oMF85KwcY57VaweFE7JNeziNaVRdCKHzNLpARdG9mMw'
];

// Optional: Add different admin role levels if needed
export const SUPER_ADMIN_ADDRESSES : string[] = [
  'GJwvBRbBZwNYzJEECfCEjKqkDf9YfKzYKwqEEmyKRYHF',
];

// Privy Chain Ids
// Mainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
// Devnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
// Testnet: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'

export const PRIVY_CHAIN_IDS = {
  MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
} as const;

