import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { assert, expect } from "chai";
import { BettingApp } from "../target/types/betting_app";
import { BettingAppSDK } from "../sdk";

describe("Update Competition", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BettingApp as Program<BettingApp>;
  const wallet = provider.wallet as anchor.Wallet;
  let sdk: BettingAppSDK;

  let competitionKeypair: Keypair;
  const newTokenA = Keypair.generate().publicKey;
  const newPriceFeedId = "NEW_FEED";
  const newAdminPubkeys = [wallet.publicKey];
  const newHouseCutFactor = 5;
  const newMinPayoutRatio = 4;

  before(async () => {
    sdk = new BettingAppSDK(
      provider.connection,
      wallet.payer,
      program.programId
    );
    // Re-use a previously created competition or create a new one:
    competitionKeypair = Keypair.generate();
    await sdk.createCompetition(
      competitionKeypair.publicKey,
      Keypair.generate().publicKey,
      "OLD_FEED",
      [wallet.publicKey],
      2,
      1
    );
  });

  it("Update competition successfully", async () => {
    await sdk.updateCompetition(
      competitionKeypair.publicKey,
      newTokenA,
      newPriceFeedId,
      newAdminPubkeys,
      newHouseCutFactor,
      newMinPayoutRatio
    );

    const competitionAccount = await sdk.getCompetition(competitionKeypair.publicKey);
    assert.ok(competitionAccount.tokenA.equals(newTokenA));
    assert.equal(competitionAccount.priceFeedId, newPriceFeedId);
    assert.equal(competitionAccount.houseCutFactor, newHouseCutFactor);
    assert.equal(competitionAccount.minPayoutRatio, newMinPayoutRatio);
  });

  it("Fails to update if user not in admin array", async () => {
    // Example negative test:
    const attacker = Keypair.generate();
    const attackerSdk = new BettingAppSDK(
      provider.connection,
      attacker,
      program.programId
    );

    try {
      await attackerSdk.updateCompetition(
        competitionKeypair.publicKey,
        newTokenA,
        "SHOULD_FAIL",
        [],
        10,
        10
      );
      expect.fail("Expected error but did not get one");
    } catch (err: any) {
      // Check error message from the program:
      expect(err.error.errorCode.code).to.equal("Unauthorized");
    }
  });
});
