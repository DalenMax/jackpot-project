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
            const registryData: GameRegistry = {
                id: registry.data.objectId,
                current_round: parseInt(fields.current_round, 10),
                current_pool_id: fields.current_pool_id?.fields?.some || undefined,
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
                winner: fields.winner?.fields?.some || undefined,
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

    // Write Functions (Transaction Builders)
    static createBuyTicketsTx(
        registryId: string,
        poolId: string,
        suiAmount: number,
        clockId: string
    ): Transaction {
        const tx = new Transaction();
        
        // Split SUI from gas coin
        const [coin] = tx.splitCoins(tx.gas, [this.formatMistAmount(suiAmount)]);
        
        tx.moveCall({
            target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::${JACKPOT_FUNCTIONS.BUY_TICKETS}`,
            arguments: [
                tx.object(registryId),
                tx.object(poolId),
                coin,
                tx.object(clockId),
            ],
        });
        
        return tx;
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
}