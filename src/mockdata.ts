import { generateRandomId } from './utils'

// Generate random IDs for reuse
const MOCK_IDS = {
  treasury: generateRandomId(),
  user: generateRandomId(),
  tokenA: generateRandomId(),
  admin: generateRandomId(),
}

export const MockData = {
  // Pool ( so every column is a pool for every time frame)
  pool: {
    poolKey: generateRandomId(),
    poolHash: generateRandomId(),
    competitionKey: generateRandomId(),
    startTime: 1770219115,
    endTime: 1770219145,
    treasury: MOCK_IDS.treasury,
  },

  // Bet ( every time someone place a bet)
  bet: {
    publicKey: generateRandomId(),
    user: MOCK_IDS.user,
    amount: 1,
    lowerBoundPrice: 100,
    upperBoundPrice: 200,
    poolKey: generateRandomId(),
    competition: generateRandomId(),
    status: 0,
  },

  // Competition ( is the entire game, so that can be from 12 clock till 6pm)
  competition: {
    competitionKey: generateRandomId(),
    tokenA: MOCK_IDS.tokenA,
    priceFeedId: generateRandomId(12),
    admin: [MOCK_IDS.admin],
    houseCutFactor: 5,
    minPayoutRatio: 80,
    interval: 30000,
    startTime: 1767225600,
    endTime: 1767225720,
  },
}
