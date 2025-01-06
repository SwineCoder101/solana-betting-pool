import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import {HorseRace} from "../sdk/src/index";
describe("Create Competition", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BettingApp as Program<HorseRace>;
  const wallet = provider.wallet as anchor.Wallet;
  let sdk: RaceHorseSDK;

  let competitionKeypair: Keypair;
  const tokenA = Keypair.generate().publicKey;
  const adminPubkeys = [wallet.publicKey];
  const priceFeedId = "SOME_FEED";
  const houseCutFactor = 3;
  const minPayoutRatio = 2;

  before(async () => {
    sdk = new BettingAppSDK(
      provider.connection,
      wallet.payer, // Keypair
      program.programId
    );
    competitionKeypair = Keypair.generate();
  });

  it("Create competition successfully", async () => {
    await sdk.createCompetition(
      competitionKeypair.publicKey,
      tokenA,
      priceFeedId,
      adminPubkeys,
      houseCutFactor,
      minPayoutRatio
    );

    const competitionAccount = await sdk.getCompetition(competitionKeypair.publicKey);
    assert.ok(competitionAccount.tokenA.equals(tokenA));
    assert.equal(competitionAccount.priceFeedId, priceFeedId);
    assert.equal(competitionAccount.houseCutFactor, houseCutFactor);
    assert.equal(competitionAccount.minPayoutRatio, minPayoutRatio);
  });
});