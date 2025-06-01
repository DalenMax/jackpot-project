module jackpot_contract::jackpot_contract {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::random::{Self, Random};
    use sui::event;
    use sui::table::{Self, Table};
    // use sui::transfer;
    // use sui::object::{Self, UID, ID};
    // use sui::tx_context::{Self, TxContext};
    // use std::vector;
    // use std::option::{Self, Option};

    // Constants
    const ROUND_DURATION_MS: u64 = 600000; // 10 minutes
    //const ROUND_DURATION_MS: u64 = 60000; // 1 minute for testing
    const MINIMUM_BET: u64 = 100000000; // 0.1 SUI
    const WINNER_PERCENTAGE: u64 = 90;
    const AIRDROP_PERCENTAGE: u64 = 5;
    const LAST_MINUTE_MS: u64 = 60000; // Last 60 seconds
    const LAST_MINUTE_MULTIPLIER: u8 = 2;

    // Error codes
    const ERR_INSUFFICIENT_PAYMENT: u64 = 1;
    const ERR_ROUND_ENDED: u64 = 2;
    const ERR_ROUND_NOT_ENDED: u64 = 3;
    const ERR_UNAUTHORIZED: u64 = 5;
    const ERR_ROUND_NOT_ACTIVE: u64 = 6;
    const ERR_NOT_CURRENT_POOL: u64 = 7;

    // Round states
    const STATE_ACTIVE: u8 = 0;
    const STATE_DRAWING: u8 = 1;
    const STATE_COMPLETED: u8 = 2;

    // Core structures
    public struct AdminCap has key {
        id: UID,
    }

    public struct GameRegistry has key {
        id: UID,
        current_round: u64,
        current_pool_id: Option<ID>,
    }

    public struct LotteryPool has key {
        id: UID,
        round_number: u64,
        start_time: u64,
        end_time: u64,
        total_pool: Balance<SUI>,
        tickets: vector<Ticket>,
        total_ticket_count: u64,
        winner: Option<address>,
        state: u8,
        airdrop_recipients: vector<address>,
    }

    public struct Ticket has store, copy, drop {
        owner: address,
        amount: u64,
        ticket_count: u64,
        multiplier: u8,
        purchase_time: u64,
    }

    public struct RoundHistory has key {
        id: UID,
        rounds: Table<u64, RoundInfo>,
    }

    public struct RoundInfo has store, copy, drop {
        pool_id: ID,
        start_time: u64,
        end_time: u64,
        state: u8,
        winner: Option<address>,
        total_pool: u64,
        total_tickets: u64,
    }

    // Events
    public struct TicketPurchased has copy, drop {
        buyer: address,
        amount: u64,
        ticket_count: u64,
        multiplier: u8,
        round_number: u64,
    }

    public struct RoundEnded has copy, drop {
        round_number: u64,
        winner: address,
        prize_amount: u64,
        total_pool: u64,
        total_tickets: u64,
    }

    public struct NewRoundStarted has copy, drop {
        round_number: u64,
        start_time: u64,
        end_time: u64,
        seed_amount: u64,
    }

    public struct AirdropDistributed has copy, drop {
        round_number: u64,
        recipients: vector<address>,
        amount_per_recipient: u64,
    }

    // Initialize the contract
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        let registry = GameRegistry {
            id: object::new(ctx),
            current_round: 0,
            current_pool_id: option::none(),
        };
        
        let history = RoundHistory {
            id: object::new(ctx),
            rounds: table::new(ctx),
        };
        
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
        transfer::share_object(history);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }

    // Create the first lottery pool (admin only)
    public fun create_initial_pool(
        _: &AdminCap,
        registry: &mut GameRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(registry.current_round == 0, ERR_UNAUTHORIZED);
        
        let current_time = clock::timestamp_ms(clock);
        let pool = LotteryPool {
            id: object::new(ctx),
            round_number: 1,
            start_time: current_time,
            end_time: current_time + ROUND_DURATION_MS,
            total_pool: balance::zero<SUI>(),
            tickets: vector::empty<Ticket>(),
            total_ticket_count: 0,
            winner: option::none(),
            state: STATE_ACTIVE,
            airdrop_recipients: vector::empty<address>(),
        };

        // Update registry
        registry.current_round = 1;
        registry.current_pool_id = option::some(object::id(&pool));

        event::emit(NewRoundStarted {
            round_number: 1,
            start_time: current_time,
            end_time: current_time + ROUND_DURATION_MS,
            seed_amount: 0,
        });

        transfer::share_object(pool);
    }

    // Buy tickets (anyone can call)
    public fun buy_tickets(
        registry: &GameRegistry,
        pool: &mut LotteryPool,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify this is the current active pool
        assert!(option::contains(&registry.current_pool_id, &object::id(pool)), ERR_NOT_CURRENT_POOL);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(pool.state == STATE_ACTIVE, ERR_ROUND_NOT_ACTIVE);
        assert!(current_time < pool.end_time, ERR_ROUND_ENDED);
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= MINIMUM_BET, ERR_INSUFFICIENT_PAYMENT);

        // Calculate multiplier for last minute
        let time_remaining = pool.end_time - current_time;
        let multiplier = if (time_remaining <= LAST_MINUTE_MS) {
            LAST_MINUTE_MULTIPLIER
        } else {
            1
        };

        // Calculate tickets (1 ticket per 0.1 SUI, with multiplier)
        let base_ticket_count = payment_amount / MINIMUM_BET;
        let total_ticket_count = base_ticket_count * (multiplier as u64);

        // Create ticket
        let ticket = Ticket {
            owner: tx_context::sender(ctx),
            amount: payment_amount,
            ticket_count: total_ticket_count,
            multiplier,
            purchase_time: current_time,
        };

        // Add to pool
        vector::push_back(&mut pool.tickets, ticket);
        pool.total_ticket_count = pool.total_ticket_count + total_ticket_count;
        balance::join(&mut pool.total_pool, coin::into_balance(payment));

        event::emit(TicketPurchased {
            buyer: tx_context::sender(ctx),
            amount: payment_amount,
            ticket_count: total_ticket_count,
            multiplier,
            round_number: pool.round_number,
        });
    }

    // Draw winner (anyone can call after round ends)
    #[allow(lint(public_random))]
    public fun draw_winner(
        registry: &GameRegistry,
        pool: &mut LotteryPool,
        random: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify this is the current pool
        assert!(option::contains(&registry.current_pool_id, &object::id(pool)), ERR_NOT_CURRENT_POOL);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= pool.end_time, ERR_ROUND_NOT_ENDED);
        assert!(pool.state == STATE_ACTIVE, ERR_ROUND_NOT_ACTIVE);

        // // Handle empty rounds (no tickets sold)
        if (pool.total_ticket_count == 0) {
            pool.state = STATE_COMPLETED;
            pool.winner = option::none();
            
            event::emit(RoundEnded {
                round_number: pool.round_number,
                winner: @0x0,
                prize_amount: 0,
                total_pool: balance::value(&pool.total_pool),
                total_tickets: 0,
            });
            
            return  // Exit early - no distributions needed
        };

        pool.state = STATE_DRAWING;

        // Generate random winning ticket
        let mut generator = random::new_generator(random, ctx);
        let winning_ticket = random::generate_u64_in_range(&mut generator, 1, pool.total_ticket_count + 1);

        // Find winner
        let mut current_count = 0;
        let mut winner_address = @0x0;
        let tickets_len = vector::length(&pool.tickets);
        let mut i = 0;

        while (i < tickets_len) {
            let ticket = vector::borrow(&pool.tickets, i);
            current_count = current_count + ticket.ticket_count;
            if (winning_ticket <= current_count) {
                winner_address = ticket.owner;
                break
            };
            i = i + 1;
        };

        pool.winner = option::some(winner_address);

        // Calculate distributions
        let total_balance = balance::value(&pool.total_pool);
        let winner_amount = (total_balance * WINNER_PERCENTAGE) / 100;
        let airdrop_total = (total_balance * AIRDROP_PERCENTAGE) / 100;

        // Select unique participants for airdrop
        let mut unique_participants = get_unique_participants(&pool.tickets);
        let participants_len = vector::length(&unique_participants);
        let airdrop_count = if (participants_len < 5) { participants_len } else { 5 };
        
        if (airdrop_count > 0) {
            let airdrop_per_recipient = airdrop_total / (airdrop_count as u64);
            let mut j = 0;
            
            while (j < airdrop_count && !vector::is_empty(&unique_participants)) {
                let current_len = vector::length(&unique_participants);
                if (current_len == 0) break;
                
                let recipient_index = if (current_len == 1) {
                    0
                } else {
                    random::generate_u64_in_range(&mut generator, 0, current_len)
                };
                
                let recipient = *vector::borrow(&unique_participants, recipient_index);
                vector::push_back(&mut pool.airdrop_recipients, recipient);
                
                // Transfer airdrop
                let airdrop_coin = coin::from_balance(
                    balance::split(&mut pool.total_pool, airdrop_per_recipient),
                    ctx
                );
                transfer::public_transfer(airdrop_coin, recipient);
                
                // Remove to avoid duplicates
                vector::remove(&mut unique_participants, recipient_index);
                j = j + 1;
            };

            event::emit(AirdropDistributed {
                round_number: pool.round_number,
                recipients: pool.airdrop_recipients,
                amount_per_recipient: airdrop_per_recipient,
            });
        };

        // Transfer winner prize
        let winner_coin = coin::from_balance(
            balance::split(&mut pool.total_pool, winner_amount),
            ctx
        );
        transfer::public_transfer(winner_coin, winner_address);

        pool.state = STATE_COMPLETED;

        event::emit(RoundEnded {
            round_number: pool.round_number,
            winner: winner_address,
            prize_amount: winner_amount,
            total_pool: total_balance,
            total_tickets: pool.total_ticket_count,
        });
    }

    // Start new round (anyone can call after previous round completes)
    public fun start_new_round(
        registry: &mut GameRegistry,
        history: &mut RoundHistory,
        old_pool: &mut LotteryPool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify this is the current completed pool
        assert!(option::contains(&registry.current_pool_id, &object::id(old_pool)), ERR_NOT_CURRENT_POOL);
        assert!(old_pool.state == STATE_COMPLETED, ERR_ROUND_NOT_ACTIVE);
        assert!(old_pool.round_number == registry.current_round, ERR_UNAUTHORIZED);
        
        // Archive the completed round
        let round_info = RoundInfo {
            pool_id: object::id(old_pool),
            start_time: old_pool.start_time,
            end_time: old_pool.end_time,
            state: old_pool.state,
            winner: old_pool.winner,
            total_pool: balance::value(&old_pool.total_pool),
            total_tickets: old_pool.total_ticket_count,
        };
        table::add(&mut history.rounds, old_pool.round_number, round_info);
        
        let current_time = clock::timestamp_ms(clock);
        let seed_balance = balance::value(&old_pool.total_pool);
        let new_round = registry.current_round + 1;
        
        // Create new pool with seed from previous round
        let new_pool = LotteryPool {
            id: object::new(ctx),
            round_number: new_round,
            start_time: current_time,
            end_time: current_time + ROUND_DURATION_MS,
            total_pool: balance::withdraw_all(&mut old_pool.total_pool),
            tickets: vector::empty<Ticket>(),
            total_ticket_count: 0,
            winner: option::none(),
            state: STATE_ACTIVE,
            airdrop_recipients: vector::empty<address>(),
        };

        // Update registry
        registry.current_round = new_round;
        registry.current_pool_id = option::some(object::id(&new_pool));

        event::emit(NewRoundStarted {
            round_number: new_round,
            start_time: current_time,
            end_time: current_time + ROUND_DURATION_MS,
            seed_amount: seed_balance,
        });

        transfer::share_object(new_pool);
    }

    // Helper function to get unique participants
    fun get_unique_participants(tickets: &vector<Ticket>): vector<address> {
        let mut unique = vector::empty<address>();
        let len = vector::length(tickets);
        let mut i = 0;

        while (i < len) {
            let ticket = vector::borrow(tickets, i);
            let participant = ticket.owner;
            
            // Check if participant already exists
            if (!vector::contains(&unique, &participant)) {
                vector::push_back(&mut unique, participant);
            };
            
            i = i + 1;
        };

        unique
    }

    // View functions
    public fun get_round_info(pool: &LotteryPool): (u64, u64, u64, u64, u64, u8) {
        (
            pool.round_number,
            pool.start_time,
            pool.end_time,
            balance::value(&pool.total_pool),
            pool.total_ticket_count,
            pool.state
        )
    }

    public fun get_user_tickets(pool: &LotteryPool, user: address): u64 {
        let mut total_tickets = 0;
        let len = vector::length(&pool.tickets);
        let mut i = 0;

        while (i < len) {
            let ticket = vector::borrow(&pool.tickets, i);
            if (ticket.owner == user) {
                total_tickets = total_tickets + ticket.ticket_count;
            };
            i = i + 1;
        };

        total_tickets
    }

    public fun get_winner(pool: &LotteryPool): Option<address> {
        pool.winner
    }

    public fun is_last_minute(pool: &LotteryPool, clock: &Clock): bool {
        let current_time = clock::timestamp_ms(clock);
        if (current_time >= pool.end_time) {
            false
        } else {
            let time_remaining = pool.end_time - current_time;
            time_remaining <= LAST_MINUTE_MS
        }
    }

    public fun get_current_round_info(registry: &GameRegistry): (u64, Option<ID>) {
        (registry.current_round, registry.current_pool_id)
    }

    public fun get_round_history(history: &RoundHistory, round_number: u64): Option<RoundInfo> {
        if (table::contains(&history.rounds, round_number)) {
            option::some(*table::borrow(&history.rounds, round_number))
        } else {
            option::none()
        }
    }

    public fun is_current_pool(registry: &GameRegistry, pool: &LotteryPool): bool {
        option::contains(&registry.current_pool_id, &object::id(pool))
    }
}
