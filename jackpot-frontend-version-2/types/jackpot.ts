// Jackpot game types based on the Move contract

export interface Ticket {
    owner: string;
    amount: number;
    ticket_count: number;
    multiplier: number;
    purchase_time: number;
}

export interface LotteryPool {
    id: string;
    round_number: number;
    start_time: number;
    end_time: number;
    total_pool: number;
    tickets: Ticket[];
    total_ticket_count: number;
    winner?: string;
    state: number;
    airdrop_recipients: string[];
}

export interface RoundInfo {
    pool_id: string;
    start_time: number;
    end_time: number;
    state: number;
    winner?: string;
    total_pool: number;
    total_tickets: number;
}

export interface GameRegistry {
    id: string;
    current_round: number;
    current_pool_id?: string;
}

// Events
export interface TicketPurchasedEvent {
    buyer: string;
    amount: number;
    ticket_count: number;
    multiplier: number;
    round_number: number;
}

export interface RoundEndedEvent {
    round_number: number;
    winner: string;
    prize_amount: number;
    total_pool: number;
    total_tickets: number;
}

export interface NewRoundStartedEvent {
    round_number: number;
    start_time: number;
    end_time: number;
    seed_amount: number;
}

export interface AirdropDistributedEvent {
    round_number: number;
    recipients: string[];
    amount_per_recipient: number;
}

// UI state types
export interface UserStats {
    tickets: number;
    winProbability: number;
    totalSpent: number;
}

export interface GameState {
    currentPool?: LotteryPool;
    registry?: GameRegistry;
    userStats: UserStats;
    isLoading: boolean;
    error?: string;
}

// API response types
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}