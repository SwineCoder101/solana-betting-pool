import { getVersionTxFromInstructions, updateCompetitionInstruction } from "../sdk/src";
import { HOUSE_CUT_FACTOR, MIN_PAYOUT_RATIO, PRICE_FEED_ID } from "../sdk/src/constants";
import { confirmTransaction, setupCompetition, SetupDTO } from "./common-setup";
import {Keypair } from "@solana/web3.js";
import { signAndSendVTx } from "./test-utils";

describe.skip("Competition", () => {
  let setupDto: SetupDTO;

  beforeAll(async () => {
    setupDto = await setupCompetition();
  }, 1000000);

  it("Create competition successfully", async () => {
    const competitionData = setupDto.competitionData;
    expect(competitionData.tokenA).toBeDefined();
    expect(competitionData.priceFeedId).toEqual(PRICE_FEED_ID);
    expect(competitionData.admin.length).toBeGreaterThan(0);
    expect(competitionData.houseCutFactor).toEqual(HOUSE_CUT_FACTOR);
    expect(competitionData.minPayoutRatio).toEqual(MIN_PAYOUT_RATIO);
    expect(competitionData.interval).toBeGreaterThan(0);
    expect(competitionData.startTime).toBeGreaterThan(0);
    expect(competitionData.endTime).toBeGreaterThan(0);
  });

  it("Update competition successfully", async () => {
    const newTokenA = Keypair.generate().publicKey;
    const newPriceFeedId = "NEW_FEED";
    const newAdminPubkeys = [setupDto.testAdmin.publicKey];
    const newHouseCutFactor = 2;
    const newMinPayoutRatio = 1;
    const interval = 12000;
    const startTime = 4070908800;
    const endTime = 4070910600;

    const updateCompetitionIx = await updateCompetitionInstruction(
      setupDto.sdkConfig.program,
      setupDto.competitionPubkey,
      newTokenA,
      newPriceFeedId,
      newAdminPubkeys,
      newHouseCutFactor,
      newMinPayoutRatio,
      interval,
      startTime,
      endTime,
      setupDto.testAdmin.publicKey
    );

    const vtx = await getVersionTxFromInstructions(setupDto.program.provider.connection, [updateCompetitionIx])
    const sigWithdraw = await signAndSendVTx(vtx, setupDto.testAdmin, setupDto.program.provider.connection)
    await confirmTransaction(sigWithdraw, setupDto.program)

    const updatedCompetitionData = await setupDto.sdkConfig.program.account.competition.fetch(setupDto.competitionPubkey);

    expect(updatedCompetitionData.tokenA.toString()).toEqual(newTokenA.toString());
    expect(updatedCompetitionData.priceFeedId).toEqual(newPriceFeedId);
    expect(updatedCompetitionData.admin.map(a => a.toString())).toEqual(newAdminPubkeys.map(a => a.toString()));
    expect(updatedCompetitionData.houseCutFactor).toEqual(newHouseCutFactor);
    expect(updatedCompetitionData.minPayoutRatio).toEqual(newMinPayoutRatio);
    expect(updatedCompetitionData.interval.toNumber()).toEqual(interval);
    expect(updatedCompetitionData.startTime.toNumber()).toEqual(startTime);
    expect(updatedCompetitionData.endTime.toNumber()).toEqual(endTime);
  });
});