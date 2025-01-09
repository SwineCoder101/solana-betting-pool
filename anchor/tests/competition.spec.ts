import { setup as commonSetup, SetupDTO } from "./common-setup";

describe("Competition", () => {
  let setupDto: SetupDTO;

  beforeAll(async () => {
    setupDto = await commonSetup();
  });

  it("Create competition successfully", async () => {
    const competitionData = setupDto.competitionData;
    console.log(competitionData);
    // assert.ok(competitionData.tokenA.equals(setupData.competitionData.tokenA));
    // assert.equal(competitionData.priceFeedId, setupData.competitionData.priceFeedId);
    // assert.equal(competitionData.houseCutFactor, setupData.competitionData.houseCutFactor);
    // assert.equal(competitionData.minPayoutRatio, setupData.competitionData.minPayoutRatio);
  });

  // it("Update competition successfully", async () => {
  //   // Add your update competition test logic here
  // });
});