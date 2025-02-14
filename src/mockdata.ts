import { CompetitionPool } from './competition-pools';
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

export const competitionsData: CompetitionPool[] = [
  {
    competitionKey: "2CGu5SqefkCCMjfXKiJVXdmDni7AdL2qwFVuVxA954gH",
    startTime: 1956507780,
    endTime: 1956508260,
    pools: [
      { poolKey: "ACGgdZtdKYtJp3ggRoVuvas16QhiR7RNkd4oUSPvsj9E", startTime: 1956507780 },
      { poolKey: "HnFL3JgLiMdVKxdFdyhBmMV7WQ9P4Gw1GEA1xNKUueoY", startTime: 1956507840 },
      { poolKey: "7Qx79K2xiXTLGrGjomnWgwDiPYbN7FuCtRRhn9c5mdG8", startTime: 1956507900 },
      { poolKey: "GR3XrHG9kPSsvEFowapU1wwT9FoTtURrWb4toTSqurvq", startTime: 1956507960 },
      { poolKey: "WRQvmf4YhxxiyPeu2ESBGn1RTdETjXLDRfVCgS4gcf9", startTime: 1956508020 },
      { poolKey: "D3w3uhQ5H73MHsyW72PRwUg8C1EN4zYCqAeezVEepj27", startTime: 1956508080 },
      { poolKey: "DNn7878NzbFejgEs1ddTtjUb3adkLqK4EAGBw86FgqDv", startTime: 1956508140 },
      { poolKey: "HYAV4PRhKLb6nNyFxrmjpzxPAxb4ELuRoZGe3wCvz7PC", startTime: 1956508200 },
    ],
  },
  {
    competitionKey: "GThEtjbFVPQFU8cZwU3839vSCpXK8WKrSnTuP6DzSgJR",
    startTime: 1924971660,
    endTime: 1924972140,
    pools: [
      { poolKey: "2tVUEsqk5f68hyndkPUe34e5oMTon2jomu6fVgeBKtjm", startTime: 1924971660 },
      { poolKey: "67jSo8XUgjCQZFB1r7LMX1dRQigFFihrEXkFvfMPogDe", startTime: 1924971720 },
      { poolKey: "4fArkCePyLsxiCcoHzEFVBA4FuUqvou8aHt76CRLRdcL", startTime: 1924971780 },
      { poolKey: "FnZxLmrtzV7biJnTubtRkt2ng4sxTdwJwuWJVCPNH94G", startTime: 1924971840 },
      { poolKey: "6MTeY4EbkqSiEseTNuN8B7kRXhBWJmQnCmu4DFnPtv6e", startTime: 1924971900 },
      { poolKey: "3mjwphdA28tPN98ium2dD9mvTVum7kJCjxkhUMS2Gak6", startTime: 1924971960 },
      { poolKey: "6rFstdKPHTBgwzuAvnfjumu3tEpixHgbMxCxjDkjV6fJ", startTime: 1924972020 },
      { poolKey: "FQNwGKASiP6dCYiYcHQcitvZoyzEUsdtdnucQQrN3rQd", startTime: 1924972080 },
    ],
  },
  {
    competitionKey: "CnW86qW2P9TEuMNHXq4ad7ZHw4xe2znSBcpC3RrrpiJ7",
    startTime: 1893435480,
    endTime: 1893435960,
    pools: [
      { poolKey: "AHWnnginzeqcAWMnWsSQ12xfgi1pQ5K262DM7LMWEKFT", startTime: 1893435480 },
      { poolKey: "2z1w5mqcT9VDTXWd43U1tCUWH6dh1ye37wcZZxNXSowp", startTime: 1893435540 },
      { poolKey: "AmiRE9ER8eNsUViZBg4AahAC4WoayhmJwdXLo6H5qWp4", startTime: 1893435600 },
      { poolKey: "EG5sFFME4iRcKfJCmWQQCx4HJQ4YNW1NYFEgy4mqWb1X", startTime: 1893435660 },
      { poolKey: "48hmijEvytoBx6eFdEYkM2gNrpeegJ6idkm3aETCYT1X", startTime: 1893435720 },
      { poolKey: "9FX3sE4e1ins9x1aAz4jMXs5qdURW1f2nSEi1STwCgCs", startTime: 1893435780 },
      { poolKey: "HDvnJKsSg21ra59viX6K9uuejyAkCa8rXQ9T47CRcQWe", startTime: 1893435840 },
      { poolKey: "29m9PqFkrRkwXZR5nMxKfhdS9aiyDJSnutdSWWcmVboM", startTime: 1893435900 },
    ],
  },
];