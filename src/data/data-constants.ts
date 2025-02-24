export const tokens = [
    {
      symbol: "BONK",
      priceFeedId: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
      tokenAddress: "7yfCkYodjoferYftgGT91H8nPpnspRAv8uv1HzEfhdhm",
      mainTokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      devnet: "bonk-devnet",
      localnet: "bonk-localnet",
      testnet: "bonk-testnet",
      mainnet: "bonk-mainnet",
      logoPath: "/path/to/bonk-logo.png",
    },
    {
      symbol: "SOL",
      priceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
      tokenAddress: "So11111111111111111111111111111111111111111",
      devnet: "sol-devnet",
      localnet: "sol-localnet",
      testnet: "sol-testnet",
      mainnet: "sol-mainnet",
      logoPath: "/path/to/sol-logo.png",
    },
  ];
  
  export const intervals = [
    { id: 1, value: 10, label: "10 seconds" },
    { id: 2, value: 30, label: "30 seconds" },
    { id: 3, value: 60, label: "1 minute" },
    { id: 4, value: 120, label: "2 minutes" },
    { id: 5, value: 300, label: "5 minutes" },
    { id: 6, value: 600, label: "10 minutes" },
  ];

  export const bluechipTokenPairs = [
    {
      code: 'ethusdt',
      name: 'Ethereum',
      competitionKey: '2CGu5SqefkCCMjfXKiJVXdmDni7AdL2qwFVuVxA954gH',
      priceFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
      tokenAddress: '7yfCkYodjoferYftgGT91H8nPpnspRAv8uv1HzEfhdhm',
      logoPath: '/images/eth.png',
      showLogo: true,
    },
    {
      code: 'btcusdt',
      name: 'Bitcoin',
      competitionKey: 'GThEtjbFVPQFU8cZwU3839vSCpXK8WKrSnTuP6DzSgJR',
      priceFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
      tokenAddress: '7yfCkYodjoferYftgGT91H8nPpnspRAv8uv1HzEfhdhm',
      logoPath: '/images/btc.png',
      showLogo: false,
    },
  ]

  export const tokenPairs = [
    {
      code: 'solusdt',
      name: 'Solana',
      symbol: 'SOL',
      competitionKey: '',
      priceFeedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
      tokenAddress: 'So11111111111111111111111111111111111111111',
      logoPath: '/images/solana.png',
      showLogo: false,
    },
    {
      code: 'bonkusdt',
      name: 'Bonk',
      symbol: 'BONK',
      competitionKey: '8bSvxAaJEJv8NUBi4wBHsS8eByKWWrGS4PDe9zqyY9G8',
      priceFeedId: '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
      tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      logoPath: '/images/bonk.png',
      showLogo: true,
    },
    {
      code: 'popcatusdt',
      name: 'Popcat',
      symbol: 'POPCAT',
      competitionKey: '',
      priceFeedId: '0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce',
      tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      logoPath: '/images/popcat.png',
      showLogo: true,
    },
    {
      code: 'wifusdt',
      name: 'Wif',
      symbol: 'WIF',
      competitionKey: '',
      priceFeedId: '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
      tokenAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      logoPath: '/images/wif.png',
      showLogo: true,
    },
    {
      code: 'trumpusdt',
      name: 'Trump',
      symbol: 'TRUMP',
      competitionKey: '',
      priceFeedId: '0x879551021853eec7a7dc827578e8e69da7e4fa8148339aa0d3d5296405be4b1a',
      tokenAddress: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
      logoPath: '/images/trump.png',
      showLogo: true,
    },
    {
      code: 'pythusdt',
      name: 'Pyth',
      symbol: 'PYTH',
      competitionKey: '',
      priceFeedId: '0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff',
      tokenAddress: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
      logoPath: '/images/pyth.png',
      showLogo: true,
    },
    {
      code: 'jtousdt',
      name: 'Jito',
      symbol: 'JTO',
      competitionKey: '',
      priceFeedId: '0xb43660a5f790c69354b0729a5ef9d50d68f1df92107540210b9cccba1f947cc2',
      tokenAddress: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
      logoPath: '/images/jito.png',
      showLogo: true,
    },
    {
      code: 'melaniausdt',
      name: 'Melania',
      symbol: 'MELANIA',
      competitionKey: '',
      priceFeedId: '0x8fef7d52c7f4e3a6258d663f9d27e64a1b6fd95ab5f7d545dbf9a515353d0064',
      tokenAddress: 'FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
      logoPath: '/images/melania.png',
      showLogo: true,
    },
    {
      code: 'hntusdt',
      name: 'HNT',
      symbol: 'HNT',
      competitionKey: '9shV6US9Qhzg9S9vZoaRJdrvZAe3PThv95oV7pKJvPNt',
      priceFeedId: '0x649fdd7ec08e8e2a20f425729854e90293dcbe2376abc47197a14da6ff339756',
      tokenAddress: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux',
      logoPath: '/images/hnt.png',
      showLogo: true,
    },
  ]

export interface PriceRange {
  id: number;
  lower: number;
  upper: number;
  label: string;
}

const BONK_CURRENT_PRICE = 0.000019;
const BONK_INCREMENT = 0.000001;

export const BONK_PRICE_RANGES: PriceRange[] = Array.from({ length: 10 }, (_, i) => {
  const midPoint = 4; // Index of middle range
  const offset = i - midPoint;
  const lower = BONK_CURRENT_PRICE + (offset * BONK_INCREMENT);
  const upper = lower + BONK_INCREMENT;
  
  return {
    id: i,
    lower,
    upper,
    label: `${lower.toFixed(6)} - ${upper.toFixed(6)} USD`
  };
});