import { Transaction } from '@mysten/sui/transactions';
import { JACKPOT_CONFIG, JACKPOT_FUNCTIONS } from '../../config/jackpot';
import { BaseApi } from './base.api';
import type { LotteryPool, GameRegistry, ApiResponse } from '../../types/jackpot';

export class JackpotApi extends BaseApi {
    
    // Read Functions
    static async getGameRegistry(registryId: string): Promise<ApiResponse<GameRegistry>> {
        try {
            const registry = await this.suiClient.getObject({
                id: registryId,
                options: {
                    showContent: true,
                    showType: true,
                }
            });

            if (!registry.data || !registry.data.content) {
                return { data: null, error: 'Registry not found' };
            }

            if (registry.data.content.dataType !== 'moveObject') {
                return { data: null, error: 'Invalid registry data type' };
            }

            const fields = registry.data.content.fields as any;
            console.log('🔍 Registry fields:', fields);
            
            // Parse the current_pool_id which is an Option<ID> in Move
            let currentPoolId: string | undefined = undefined;
            if (fields.current_pool_id) {
                const poolIdField = fields.current_pool_id;
                console.log('🔍 Pool ID field structure:', poolIdField);
                
                // Handle different Option representations
                if (typeof poolIdField === 'string' && poolIdField !== '0x0') {
                    currentPoolId = poolIdField;
                } else if (poolIdField && typeof poolIdField === 'object') {
                    if ('vec' in poolIdField && Array.isArray(poolIdField.vec) && poolIdField.vec.length > 0) {
                        currentPoolId = String(poolIdField.vec[0]);
                    } else if ('fields' in poolIdField && poolIdField.fields) {
                        currentPoolId = String(poolIdField.fields);
                    }
                }
            }
            
            console.log('✅ Parsed registry data:', { current_round: fields.current_round, currentPoolId });
            
            const registryData: GameRegistry = {
                id: registry.data.objectId,
                current_round: parseInt(fields.current_round, 10),
                current_pool_id: currentPoolId,
            };

            return { data: registryData, error: null };
        } catch (err) {
            console.error('Error getting registry:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: null, error: errorMessage };
        }
    }

    static async getLotteryPool(poolId: string): Promise<ApiResponse<LotteryPool>> {
        try {
            const pool = await this.suiClient.getObject({
                id: poolId,
                options: {
                    showContent: true,
                    showType: true,
                }
            });

            if (!pool.data || !pool.data.content) {
                return { data: null, error: 'Pool not found' };
            }

            if (pool.data.content.dataType !== 'moveObject') {
                return { data: null, error: 'Invalid pool data type' };
            }

            const fields = pool.data.content.fields as any;
            const poolData: LotteryPool = {
                id: pool.data.objectId,
                round_number: parseInt(fields.round_number, 10),
                start_time: parseInt(fields.start_time, 10),
                end_time: parseInt(fields.end_time, 10),
                total_pool: this.formatSuiAmount(fields.total_pool),
                tickets: fields.tickets || [],
                total_ticket_count: parseInt(fields.total_ticket_count, 10),
                winner: fields.winner || undefined,
                state: parseInt(fields.state, 10),
                airdrop_recipients: fields.airdrop_recipients || [],
            };

            return { data: poolData, error: null };
        } catch (err) {
            console.error('Error getting pool:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: null, error: errorMessage };
        }
    }

    static async getRoundInfo(poolId: string): Promise<ApiResponse<[number, number, number, number, number, number]>> {
        try {
            const result = await this.suiClient.devInspectTransactionBlock({
                transactionBlock: this.createGetRoundInfoTx(poolId),
                sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
            });

            if (result.results?.[0]?.returnValues) {
                const returnValues = result.results[0].returnValues;
                return {
                    data: [
                        parseInt(String(returnValues[0][0]), 10), // round_number
                        parseInt(String(returnValues[1][0]), 10), // start_time
                        parseInt(String(returnValues[2][0]), 10), // end_time
                        this.formatSuiAmount(String(returnValues[3][0])), // total_pool
                        parseInt(String(returnValues[4][0]), 10), // total_ticket_count
                        parseInt(String(returnValues[5][0]), 10), // state
                    ] as [number, number, number, number, number, number],
                    error: null
                };
            }

            return { data: null, error: 'No return values' };
        } catch (err) {
            console.error('Error getting round info:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: null, error: errorMessage };
        }
    }

    static async getUserTickets(poolId: string, userAddress: string): Promise<ApiResponse<number>> {
        try {
            const result = await this.suiClient.devInspectTransactionBlock({
                transactionBlock: this.createGetUserTicketsTx(poolId, userAddress),
                sender: userAddress,
            });

            if (result.results?.[0]?.returnValues) {
                const ticketCount = parseInt(String(result.results[0].returnValues[0][0]), 10);
                return { data: ticketCount, error: null };
            }

            return { data: 0, error: null };
        } catch (err) {
            console.error('Error getting user tickets:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: 0, error: errorMessage };
        }
    }

    static async isLastMinute(poolId: string, clockId: string): Promise<ApiResponse<boolean>> {
        try {
            const result = await this.suiClient.devInspectTransactionBlock({
                transactionBlock: this.createIsLastMinuteTx(poolId, clockId),
                sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
            });

            if (result.results?.[0]?.returnValues) {
                const isLastMin = String(result.results[0].returnValues[0][0]) === '1';
                return { data: isLastMin, error: null };
            }

            return { data: false, error: null };
        } catch (err) {
            console.error('Error checking last minute:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: false, error: errorMessage };
        }
    }

    static async getCurrentPoolInfo(registryId: string): Promise<ApiResponse<{currentRound: number, currentPoolId: string | null}>> {
        try {
            console.log('🔍 Getting current pool info from registry:', registryId);
            const result = await this.suiClient.devInspectTransactionBlock({
                transactionBlock: this.createGetCurrentPoolInfoTx(registryId),
                sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
            });

            console.log('📡 getCurrentPoolInfo raw result:', JSON.stringify(result, null, 2));

            if (result.results?.[0]?.returnValues) {
                const returnValues = result.results[0].returnValues;
                console.log('📊 Return values:', returnValues);
                
                const currentRound = parseInt(String(returnValues[0][0]), 10);
                
                // Handle optional pool ID - the second return value is an Option<ID>
                let currentPoolId: string | null = null;
                if (returnValues[1]) {
                    const optionValue = returnValues[1][0];
                    console.log('🔍 Option value structure:', optionValue);
                    
                    // For Option<ID> in Sui, check if it's Some(value) or None
                    if (optionValue && typeof optionValue === 'object' && 'vec' in optionValue) {
                        // Option is represented as { vec: [id] } for Some(id) or { vec: [] } for None
                        const vec = optionValue.vec;
                        if (Array.isArray(vec) && vec.length > 0) {
                            currentPoolId = String(vec[0]);
                        }
                    } else if (typeof optionValue === 'string' && optionValue !== '0x0') {
                        // Direct string value
                        currentPoolId = optionValue;
                    } else if (Array.isArray(optionValue) && optionValue.length > 0) {
                        // Array format
                        currentPoolId = String(optionValue[0]);
                    }
                }
                
                console.log('✅ Parsed pool info:', { currentRound, currentPoolId });
                
                return {
                    data: { currentRound, currentPoolId },
                    error: null
                };
            }

            console.log('❌ No return values found');
            return { data: null, error: 'No return values from contract call' };
        } catch (err) {
            console.error('💥 Error getting current pool info:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            return { data: null, error: errorMessage };
        }
    }

    // Write Functions (Transaction Builders)
    static createBuyTicketsTx(
        registryId: string,
        poolId: string,
        suiAmount: number,
        clockId: string
    ): Transaction {
        console.log('🔧 Building transaction with:', {
            registryId,
            poolId,
            suiAmount,
            clockId,
            packageId: JACKPOT_CONFIG.PACKAGE_ID,
            moduleName: JACKPOT_CONFIG.MODULE_NAME,
            function: JACKPOT_FUNCTIONS.BUY_TICKETS
        });

        // Validate inputs
        if (!registryId || !poolId || !suiAmount || !clockId) {
            throw new Error('Missing required parameters for transaction building');
        }

        if (!JACKPOT_CONFIG.PACKAGE_ID) {
            throw new Error('PACKAGE_ID not configured');
        }

        const tx = new Transaction();
        
        try {
            // Convert SUI to MIST (multiply by 1_000_000_000)
            const mistAmount = Math.floor(suiAmount * 1_000_000_000);
            console.log('💰 Amount conversion:', { suiAmount, mistAmount });
            
            // Split SUI from gas coin
            const [coin] = tx.splitCoins(tx.gas, [mistAmount]);
            
            const target = `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.BUY_TICKETS}`;
            console.log('🎯 Move call target:', target);
            
            tx.moveCall({
                target,
                arguments: [
                    tx.object(registryId),
                    tx.object(poolId),
                    coin,
                    tx.object(clockId),
                ],
            });
            
            console.log('✅ Transaction built successfully');
            return tx;
        } catch (error) {
            console.error('💥 Error building transaction:', error);
            throw error;
        }
    }

    static createDrawWinnerTx(
        registryId: string,
        poolId: string,
        randomId: string,
        clockId: string
    ): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.DRAW_WINNER}`,
            arguments: [
                tx.object(registryId),
                tx.object(poolId),
                tx.object(randomId),
                tx.object(clockId),
            ],
        });
        
        return tx;
    }

    static createStartNewRoundTx(
        registryId: string,
        historyId: string,
        oldPoolId: string,
        clockId: string
    ): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.START_NEW_ROUND}`,
            arguments: [
                tx.object(registryId),
                tx.object(historyId),
                tx.object(oldPoolId),
                tx.object(clockId),
            ],
        });
        
        return tx;
    }

    // Helper transactions for read functions
    private static createGetRoundInfoTx(poolId: string): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.GET_ROUND_INFO}`,
            arguments: [tx.object(poolId)],
        });
        
        return tx;
    }

    private static createGetUserTicketsTx(poolId: string, userAddress: string): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.GET_USER_TICKETS}`,
            arguments: [
                tx.object(poolId),
                tx.pure.address(userAddress),
            ],
        });
        
        return tx;
    }

    private static createIsLastMinuteTx(poolId: string, clockId: string): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.IS_LAST_MINUTE}`,
            arguments: [
                tx.object(poolId),
                tx.object(clockId),
            ],
        });
        
        return tx;
    }

    private static createGetCurrentPoolInfoTx(registryId: string): Transaction {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.GET_CURRENT_POOL_INFO}`,
            arguments: [tx.object(registryId)],
        });
        
        return tx;
    }
}