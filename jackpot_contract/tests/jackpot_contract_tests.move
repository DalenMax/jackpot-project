#[test_only]
module jackpot_contract::jackpot_contract_tests {
    use jackpot_contract::jackpot_contract::{Self, LotteryPool, AdminCap, GameRegistry, RoundHistory};
    use sui::test_scenario::{Self as test, Scenario};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::random::{Self, Random};
    use std::option;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const USER3: address = @0x3;

    const MINIMUM_BET: u64 = 100000000; // 0.1 SUI
    const ROUND_DURATION_MS: u64 = 600000; // 10 minutes

    #[test]
    fun test_init_and_create_pool() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize the contract
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);

        // Check admin cap and registry were created
        {
            assert!(test::has_most_recent_for_sender<AdminCap>(&scenario), 0);
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let history = test::take_shared<RoundHistory>(&scenario);
            
            // Verify initial registry state
            let (current_round, current_pool_id) = jackpot_contract::get_current_round_info(&registry);
            assert!(current_round == 0, 1);
            assert!(option::is_none(&current_pool_id), 2);
            
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            // Create initial pool
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            // Verify registry was updated
            let (new_round, new_pool_id) = jackpot_contract::get_current_round_info(&registry);
            assert!(new_round == 1, 3);
            assert!(option::is_some(&new_pool_id), 4);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            test::return_shared(history);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        // Verify pool was created and shared
        assert!(test::has_most_recent_shared<LotteryPool>(), 5);
        
        {
            let pool = test::take_shared<LotteryPool>(&scenario);
            let (round_number, start_time, end_time, total_pool, total_tickets, state) = 
                jackpot_contract::get_round_info(&pool);
            
            assert!(round_number == 1, 6);
            assert!(total_pool == 0, 7);
            assert!(total_tickets == 0, 8);
            assert!(state == 0, 9); // STATE_ACTIVE
            assert!(end_time == start_time + ROUND_DURATION_MS, 10);
            
            test::return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    fun test_buy_tickets_normal() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        // User1 buys tickets
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment = coin::mint_for_testing<SUI>(500000000, ctx); // 0.5 SUI
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            // Verify ticket purchase
            let (_, _, _, total_pool, total_tickets, _) = jackpot_contract::get_round_info(&pool);
            assert!(total_pool == 500000000, 0);
            assert!(total_tickets == 5, 1); // 0.5 SUI / 0.1 SUI = 5 tickets
            
            let user_tickets = jackpot_contract::get_user_tickets(&pool, USER1);
            assert!(user_tickets == 5, 2);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }

    #[test]
    fun test_last_minute_multiplier() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let mut clock = clock::create_for_testing(ctx);
            
            // Fast forward to last minute (within 60 seconds of end)
            let (_, start_time, end_time, _, _, _) = jackpot_contract::get_round_info(&pool);
            let last_minute_time = end_time - 30000; // 30 seconds before end
            clock::set_for_testing(&mut clock, last_minute_time);
            
            // Verify we're in last minute
            assert!(jackpot_contract::is_last_minute(&pool, &clock), 0);
            
            // Buy tickets in last minute
            let payment = coin::mint_for_testing<SUI>(100000000, ctx); // 0.1 SUI
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            // Should get 2x multiplier (2 tickets instead of 1)
            let user_tickets = jackpot_contract::get_user_tickets(&pool, USER1);
            assert!(user_tickets == 2, 1);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }

    #[test]
    fun test_draw_winner_and_distribution() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, @0x0);
        {
            let ctx = test::ctx(&mut scenario);
            random::create_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        // Multiple users buy tickets
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment1 = coin::mint_for_testing<SUI>(1000000000, ctx); // 1 SUI
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment1, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, USER2);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment2 = coin::mint_for_testing<SUI>(500000000, ctx); // 0.5 SUI
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment2, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, USER3);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment3 = coin::mint_for_testing<SUI>(300000000, ctx); // 0.3 SUI
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment3, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, ADMIN);
        
        // Draw winner
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let random_state = test::take_shared<Random>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let mut clock = clock::create_for_testing(ctx);
            
            // Fast forward past end time
            let (_, _, end_time, _, _, _) = jackpot_contract::get_round_info(&pool);
            clock::set_for_testing(&mut clock, end_time + 1000);
            
            jackpot_contract::draw_winner(&registry, &mut pool, &random_state, &clock, ctx);
            
            // Verify winner was selected
            let winner = jackpot_contract::get_winner(&pool);
            assert!(option::is_some(&winner), 0);
            
            // Verify state changed to completed
            let (_, _, _, _, _, state) = jackpot_contract::get_round_info(&pool);
            assert!(state == 2, 1); // STATE_COMPLETED
            
            test::return_shared(registry);
            test::return_shared(pool);
            test::return_shared(random_state);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }

    #[test]
    fun test_start_new_round() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup and complete first round
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, @0x0);
        {
            let ctx = test::ctx(&mut scenario);
            random::create_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        // Buy tickets and complete round
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment = coin::mint_for_testing<SUI>(1000000000, ctx);
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, ADMIN);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let random_state = test::take_shared<Random>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let mut clock = clock::create_for_testing(ctx);
            
            let (_, _, end_time, _, _, _) = jackpot_contract::get_round_info(&pool);
            clock::set_for_testing(&mut clock, end_time + 1000);
            
            jackpot_contract::draw_winner(&registry, &mut pool, &random_state, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(random_state);
            clock::destroy_for_testing(clock);
            test::return_shared(pool);
        };
        
        // Start new round
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let mut history = test::take_shared<RoundHistory>(&scenario);
            let mut old_pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            // Verify round 1 in registry before starting new round
            let (round_before, _) = jackpot_contract::get_current_round_info(&registry);
            assert!(round_before == 1, 0);
            
            jackpot_contract::start_new_round(&mut registry, &mut history, &mut old_pool, &clock, ctx);
            
            // Verify registry updated to round 2
            let (round_after, new_pool_id) = jackpot_contract::get_current_round_info(&registry);
            assert!(round_after == 2, 1);
            assert!(option::is_some(&new_pool_id), 2);
            
            // Verify round 1 was archived in history
            let round1_info = jackpot_contract::get_round_history(&history, 1);
            assert!(option::is_some(&round1_info), 3);
            
            test::return_shared(registry);
            test::return_shared(history);
            test::return_shared(old_pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, ADMIN);
        
        // Verify new pool was created
        assert!(test::has_most_recent_shared<LotteryPool>(), 4);
        
        test::end(scenario);
    }

    #[test]
    fun test_registry_validation() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let pool = test::take_shared<LotteryPool>(&scenario);
            
            // Verify is_current_pool returns true for active pool
            assert!(jackpot_contract::is_current_pool(&registry, &pool), 0);
            
            test::return_shared(registry);
            test::return_shared(pool);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // ERR_INSUFFICIENT_PAYMENT
    fun test_insufficient_payment() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            // Try to buy with insufficient payment
            let payment = coin::mint_for_testing<SUI>(50000000, ctx); // 0.05 SUI < minimum
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 2)] // ERR_ROUND_ENDED
    fun test_buy_after_round_ended() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        test::next_tx(&mut scenario, USER1);
        
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let mut clock = clock::create_for_testing(ctx);
            
            // Fast forward past end time
            let (_, _, end_time, _, _, _) = jackpot_contract::get_round_info(&pool);
            clock::set_for_testing(&mut clock, end_time + 1000);
            
            // Try to buy tickets after round ended
            let payment = coin::mint_for_testing<SUI>(MINIMUM_BET, ctx);
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 7)] // ERR_NOT_CURRENT_POOL
    fun test_wrong_pool_validation() {
        let mut scenario = test::begin(ADMIN);
        
        // Setup two rounds
        {
            let ctx = test::ctx(&mut scenario);
            jackpot_contract::init_for_testing(ctx);
        };
        test::next_tx(&mut scenario, @0x0);
        {
            let ctx = test::ctx(&mut scenario);
            random::create_for_testing(ctx);
        };
        test::next_tx(&mut scenario, ADMIN);
        
        // Create first pool
        {
            let admin_cap = test::take_from_sender<AdminCap>(&scenario);
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::create_initial_pool(&admin_cap, &mut registry, &clock, ctx);
            
            test::return_to_sender(&scenario, admin_cap);
            test::return_shared(registry);
            clock::destroy_for_testing(clock);
        };
        
        // Complete first round and start second
        test::next_tx(&mut scenario, USER1);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            let payment = coin::mint_for_testing<SUI>(1000000000, ctx);
            
            jackpot_contract::buy_tickets(&registry, &mut pool, payment, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, ADMIN);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut pool = test::take_shared<LotteryPool>(&scenario);
            let random_state = test::take_shared<Random>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let mut clock = clock::create_for_testing(ctx);
            
            let (_, _, end_time, _, _, _) = jackpot_contract::get_round_info(&pool);
            clock::set_for_testing(&mut clock, end_time + 1000);
            
            jackpot_contract::draw_winner(&registry, &mut pool, &random_state, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(pool);
            test::return_shared(random_state);
            clock::destroy_for_testing(clock);
        };
        
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test::take_shared<GameRegistry>(&scenario);
            let mut history = test::take_shared<RoundHistory>(&scenario);
            let mut old_pool = test::take_shared<LotteryPool>(&scenario);
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            jackpot_contract::start_new_round(&mut registry, &mut history, &mut old_pool, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(history);
            test::return_shared(old_pool);
            clock::destroy_for_testing(clock);
        };
        
        // Try to buy tickets on old pool (should fail)
        test::next_tx(&mut scenario, USER2);
        {
            let registry = test::take_shared<GameRegistry>(&scenario);
            let mut old_pool = test::take_shared<LotteryPool>(&scenario); // This is the old pool
            let ctx = test::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx);
            
            // This should fail because old_pool is not the current pool
            let payment = coin::mint_for_testing<SUI>(MINIMUM_BET, ctx);
            jackpot_contract::buy_tickets(&registry, &mut old_pool, payment, &clock, ctx);
            
            test::return_shared(registry);
            test::return_shared(old_pool);
            clock::destroy_for_testing(clock);
        };
        test::end(scenario);
    }
}