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

  before(async () => {});

  it("Create competition successfully", async () => {});
});