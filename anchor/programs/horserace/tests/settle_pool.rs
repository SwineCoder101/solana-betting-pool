#![cfg(test)]

use anchor_lang::{
    prelude::*,
    solana_program::{system_instruction, system_program},
};
use horse_race::{
    instructions::admin::create_competition,
    states::{Pool, Bet, BetStatus, Competition},
    errors::SettlementError,
    ID as program_id,
};
use solana_program_test::*;
use solana_sdk::{
    signature::Keypair,
    signer::Signer,
    transaction::Transaction,
    system_instruction::create_account,
};

#[tokio::test]
async fn test_settle_pool_with_losing_bet() {
    // Initialize program test
    let mut program_test = ProgramTest::new(
        "horse_race",
        program_id,
        None,
    );

    // Generate accounts
    let admin = Keypair::new();
    let user = Keypair::new();
    let treasury = Keypair::new();
    let pool = Keypair::new();
    let competition = Keypair::new();
    let bet = Keypair::new();

    const INITIAL_USER_BALANCE: u64 = 10_000_000_000;
    const BET_AMOUNT: u64 = 1_000_000_000;

    // Add accounts with initial balances
    program_test.add_account(
        user.pubkey(),
        solana_sdk::account::Account {
            lamports: INITIAL_USER_BALANCE,
            owner: system_program::ID,
            ..Default::default()
        },
    );

    // Start test context
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // Get rent
    let rent = banks_client.get_rent().await.unwrap();
    
    // Create competition account
    let competition_space = 1000; // Adjust based on your Competition struct size
    let create_competition_ix = create_account(
        &payer.pubkey(),
        &competition.pubkey(),
        rent.minimum_balance(competition_space),
        competition_space as u64,
        &program_id,
    );
    // Initialize competition
    let init_competition_ix = horse_race::instructions::admin::CreateCompetition::run_create_competition(
        program_id,
        competition.pubkey(),
        admin.pubkey(),
        vec![admin.pubkey()], // admin authorities
        // Add other competition params as needed
    );

    // Create pool account
    let pool_space = 1000; // Adjust based on your Pool struct size
    let create_pool_ix = create_account(
        &payer.pubkey(),
        &pool.pubkey(),
        rent.minimum_balance(pool_space),
        pool_space as u64,
        &program_id,
    );

    // Create bet account
    let bet_space = 1000; // Adjust based on your Bet struct size
    let create_bet_ix = create_account(
        &payer.pubkey(),
        &bet.pubkey(),
        rent.minimum_balance(bet_space),
        bet_space as u64,
        &program_id,
    );

    // Execute setup transactions
    let setup_tx = Transaction::new_signed_with_payer(
        &[
            create_competition_ix,
            init_competition_ix,
            create_pool_ix,
            create_bet_ix,
        ],
        Some(&payer.pubkey()),
        &[&payer, &competition, &pool, &bet],
        recent_blockhash,
    );
    banks_client.process_transaction(setup_tx).await.unwrap();

    // Verify initial balances
    let pool_balance_before = banks_client
        .get_account(pool.pubkey())
        .await
        .unwrap()
        .unwrap()
        .lamports;

    // Create settle pool instruction
    let settle_ix = horse_race::instructions::run_settle_pool_by_price(
        program_id,
        admin.pubkey(),
        pool.pubkey(),
        competition.pubkey(),
        treasury.pubkey(),
        300, // Outside bet range
        400,
        vec![
            AccountMeta::new(bet.pubkey(), false),
            AccountMeta::new(user.pubkey(), false),
        ],
    );

    // Execute settlement
    let settle_tx = Transaction::new_signed_with_payer(
        &[settle_ix],
        Some(&payer.pubkey()),
        &[&admin, &payer],
        recent_blockhash,
    );
    banks_client.process_transaction(settle_tx).await.unwrap();

    // Verify final state
    let bet_account = banks_client
        .get_account(bet.pubkey())
        .await
        .unwrap()
        .unwrap();
    let bet_data = Bet::try_deserialize(&mut bet_account.data.as_ref()).unwrap();
    assert_eq!(bet_data.status, BetStatus::Settled, "Bet should be marked as settled");

    // Verify balances
    let pool_balance_after = banks_client
        .get_account(pool.pubkey())
        .await
        .unwrap()
        .unwrap()
        .lamports;
    assert_eq!(pool_balance_after, 0, "Pool should be empty after settlement");
} 