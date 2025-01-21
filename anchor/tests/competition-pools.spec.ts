import { setupCompetitionWithPools, SetupDTO } from "./common-setup";

describe("Competition with Pools", () => {
  let setupDto: SetupDTO;

  beforeAll(async () => {
    setupDto = await setupCompetitionWithPools();
  });

  it("Create competition with pools successfully", async () => {
    const { program, competitionPubkey, competitionData, poolKeys, adminKp } = setupDto;

    // Assert competition is created
    const fetchedCompetition = await program.account.competition.fetch(competitionPubkey);
    expect(fetchedCompetition.tokenA.toString()).toEqual(competitionData.tokenA.toString());
    expect(fetchedCompetition.priceFeedId).toEqual(competitionData.priceFeedId);
    expect(fetchedCompetition.admin.map(pb => pb.toBase58())).toEqual(competitionData.admin);
    expect(fetchedCompetition.houseCutFactor).toEqual(competitionData.houseCutFactor);
    expect(fetchedCompetition.minPayoutRatio).toEqual(competitionData.minPayoutRatio);
    expect(fetchedCompetition.interval.toNumber()).toEqual(competitionData.interval);
    expect(fetchedCompetition.startTime.toNumber()).toEqual(competitionData.startTime);
    expect(fetchedCompetition.endTime.toNumber()).toEqual(competitionData.endTime);

    // Assert correct number of pools are created
    const numOfPools = Math.floor((competitionData.endTime - competitionData.startTime) / competitionData.interval);
    console.log('Start time:', competitionData.startTime);
    console.log('End time:', competitionData.endTime);
    console.log('Interval:', competitionData.interval);
    console.log(competitionData.endTime - competitionData.startTime);
    console.log('Num of pools:', numOfPools);
    expect(poolKeys?.length).toEqual(numOfPools);

    if (poolKeys  && poolKeys.length > 0){
        for (let i = 0; i < poolKeys.length; i++) {
            const pool = await program.account.pool.fetch(poolKeys[i]);
            expect(pool.competitionKey.toString()).toEqual(competitionPubkey.toString());
            expect(pool.startTime.toNumber()).toEqual(competitionData.startTime + i * competitionData.interval);
            expect(pool.endTime.toNumber()).toEqual(pool.startTime.toNumber() + competitionData.interval);
            expect(pool.treasury.toString()).toEqual(adminKp.publicKey.toBase58());
          }
    }   
  });

  it("Create multiple competitions with pools successfully", async () => {
    const numCompetitions = 3;
    const competitions: SetupDTO[] = [];

    for (let i = 0; i < numCompetitions; i++) {
      const setupDto = await setupCompetitionWithPools();
      competitions.push(setupDto);
    }

    for (const setupDto of competitions) {
      const { program, adminKp, competitionPubkey, competitionData, poolKeys } = setupDto;

      // Assert competition is created
      const fetchedCompetition = await program.account.competition.fetch(competitionPubkey);
      expect(fetchedCompetition.tokenA.toString()).toEqual(competitionData.tokenA.toString());
      expect(fetchedCompetition.priceFeedId).toEqual(competitionData.priceFeedId);
      expect(fetchedCompetition.admin.map(pb => pb.toBase58())).toEqual(competitionData.admin);
      expect(fetchedCompetition.houseCutFactor).toEqual(competitionData.houseCutFactor);
      expect(fetchedCompetition.minPayoutRatio).toEqual(competitionData.minPayoutRatio);
      expect(fetchedCompetition.interval.toNumber()).toEqual(competitionData.interval);
      expect(fetchedCompetition.startTime.toNumber()).toEqual(competitionData.startTime);
      expect(fetchedCompetition.endTime.toNumber()).toEqual(competitionData.endTime);

      // Assert correct number of pools are created
      const numOfPools = Math.floor((competitionData.endTime - competitionData.startTime) / competitionData.interval);
      expect(poolKeys?.length).toEqual(numOfPools);

      if (poolKeys  && poolKeys.length > 0){
        for (let i = 0; i < poolKeys?.length; i++) {
            const pool = await program.account.pool.fetch(poolKeys[i]);
            expect(pool.competitionKey.toString()).toEqual(competitionPubkey.toString());
            expect(pool.startTime.toNumber()).toEqual(competitionData.startTime + i * competitionData.interval);
            expect(pool.endTime.toNumber()).toEqual(pool.startTime.toNumber() + competitionData.interval);
            expect(pool.treasury.toString()).toEqual(adminKp.publicKey.toBase58());
          }
      }
    }
  });
});