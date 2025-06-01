// Jackpot contract configuration
export const JACKPOT_CONFIG = {
  // Contract deployment info loaded from environment variables
  PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID || "",
  MODULE_NAME: "jackpot_contract",
  
  // Object IDs from deployment
  ADMIN_CAP: process.env.NEXT_PUBLIC_ADMIN_CAP || "",
  GAME_REGISTRY: process.env.NEXT_PUBLIC_GAME_REGISTRY || "",
  ROUND_HISTORY: process.env.NEXT_PUBLIC_ROUND_HISTORY || "",
  CURRENT_POOL: process.env.NEXT_PUBLIC_CURRENT_POOL || "", // Current active pool

  // Contract constants (matching the Move contract)
  ROUND_DURATION_MS: 600000, // 10 minutes
  MINIMUM_BET: 100000000, // 0.1 SUI in MIST
  WINNER_PERCENTAGE: 90,
  AIRDROP_PERCENTAGE: 5,
  LAST_MINUTE_MS: 60000, // Last 60 seconds
  LAST_MINUTE_MULTIPLIER: 2,

  // Round states
  STATE_ACTIVE: 0,
  STATE_DRAWING: 1,
  STATE_COMPLETED: 2,
} as const;

// Contract function names
export const JACKPOT_FUNCTIONS = {
  CREATE_INITIAL_POOL: "create_initial_pool",
  BUY_TICKETS: "buy_tickets",
  DRAW_WINNER: "draw_winner",
  START_NEW_ROUND: "start_new_round",
  GET_ROUND_INFO: "get_round_info",
  GET_USER_TICKETS: "get_user_tickets",
  GET_WINNER: "get_winner",
  IS_LAST_MINUTE: "is_last_minute",
  GET_CURRENT_ROUND_INFO: "get_current_round_info",
  IS_CURRENT_POOL: "is_current_pool",
} as const;