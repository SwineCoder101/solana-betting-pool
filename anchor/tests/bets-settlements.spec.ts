import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getBetAccountsForPool, getBetAccountsForUser } from "../sdk/src";
import { setupCompetitionWithPools, SetupDTO } from "./common-setup";
import { createUserWithFunds, executeCreateBet } from "./test-utils";
import { createBet } from "../sdk/src/instructions/user/create-bet";

describe.skip("Bets", () => {
  let setupDto: SetupDTO;
  let program, poolKeys: PublicKey[], competitionPubkey, connection;
  let signer: Keypair;
  const poolsToBetCountMap = new Map<PublicKey, number>();
  let numberOfBetsForSigner: number; 

  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools();
    program = setupDto.program;
    poolKeys = setupDto.poolKeys ?? [Keypair.generate().publicKey];
    competitionPubkey = setupDto.competitionPubkey;
    connection = setupDto.sdkConfig.connection;
    numberOfBetsForSigner = 0;

    signer = await createUserWithFunds(connection);

    // Initialize bet counts for each pool
    for (const poolKey of poolKeys) {
      const betAccounts = await getBetAccountsForPool(program, poolKey);
      poolsToBetCountMap.set(poolKey, betAccounts.length);
    }
    numberOfBetsForSigner = (await getBetAccountsForUser(program, signer.publicKey)).length;
  }, 30000);

  it("should settle all funds from pool to treasury if no bet has won", async () => {
    const amount = LAMPORTS_PER_SOL;
    const lowerBoundPrice = 50;
    const upperBoundPrice = 150;
    const poolKey = poolKeys[0];

    await executeCreateBet(program, signer, amount, lowerBoundPrice, upperBoundPrice, poolKey, competitionPubkey, signer);

  });

  it("should settle to user if bet has won", async () => {
  });

  it("should settle to all users if all bets have won", async () => {
  });

  it("should settle to users if some bets have won and settle to treasury if no bet has won", async () => {
  });

//TODO: Uncomment these when we have a way to test time travel
//   it("should not settle if pool is not ended", async () => {
//   });

//   it("should not settle if competition has ended", async () => {
//   });

});
