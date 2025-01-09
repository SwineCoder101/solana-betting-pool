import { updateCompetitionInstruction } from "../sdk/src";
import { HOUSE_CUT_FACTOR, MIN_PAYOUT_RATIO, PRICE_FEED_ID } from "../sdk/src/constants";
import { setup as commonSetup, SetupDTO } from "./common-setup";
import {Keypair, PublicKey } from "@solana/web3.js";

describe("Competition", () => {
  let setupDto: SetupDTO;

  beforeAll(async () => {
    setupDto = await commonSetup();
  });

  it("Create competition successfully", async () => {
    const competitionData = setupDto.competitionData;
    expect(competitionData.tokenA).toBeDefined();
    expect(competitionData.priceFeedId).toEqual(PRICE_FEED_ID);
    expect(competitionData.admin.length).toBeGreaterThan(0);
    expect(competitionData.houseCutFactor).toEqual(HOUSE_CUT_FACTOR);
    expect(competitionData.minPayoutRatio).toEqual(MIN_PAYOUT_RATIO);
  });

  it("Update competition successfully", async () => {
    const newTokenA = Keypair.generate().publicKey;
    const newPriceFeedId = "NEW_FEED";
    const newAdminPubkeys = [Keypair.generate().publicKey];
    const newHouseCutFactor = 2;
    const newMinPayoutRatio = 1;

    await updateCompetitionInstruction(
      setupDto.sdkConfig.program,
      setupDto.competitionPubkey,
      newTokenA,
      newPriceFeedId,
      newAdminPubkeys,
      newHouseCutFactor,
      newMinPayoutRatio
    );

    const updatedCompetitionData = await setupDto.sdkConfig.program.account.competition.fetch(setupDto.competitionPubkey);

    expect(updatedCompetitionData.tokenA.toString()).toEqual(newTokenA.toString());
    expect(updatedCompetitionData.priceFeedId).toEqual(newPriceFeedId);
    expect(updatedCompetitionData.admin.map(a => a.toString())).toEqual(newAdminPubkeys.map(a => a.toString()));
    expect(updatedCompetitionData.houseCutFactor).toEqual(newHouseCutFactor);
    expect(updatedCompetitionData.minPayoutRatio).toEqual(newMinPayoutRatio);
  });
});