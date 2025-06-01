import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { JACKPOT_CONFIG } from '../../config/jackpot';

export interface PoolDiscoveryResult {
  poolId: string;
  network: 'devnet' | 'testnet' | 'mainnet';
  poolData: any;
}

export class PoolDiscovery {
  private static async tryNetwork(network: 'devnet' | 'testnet' | 'mainnet', registryId: string): Promise<PoolDiscoveryResult | null> {
    try {
      const client = new SuiClient({
        url: getFullnodeUrl(network)
      });
      
      const registry = await client.getObject({
        id: registryId,
        options: {
          showContent: true,
          showType: true,
        }
      });
      
      if (registry.data?.content?.dataType === 'moveObject') {
        const fields = registry.data.content.fields as any;
        const currentPoolId = fields.current_pool_id;
        
        if (currentPoolId) {
          // Verify pool exists
          const pool = await client.getObject({
            id: currentPoolId,
            options: {
              showContent: true,
              showType: true,
            }
          });
          
          if (pool.data?.content?.dataType === 'moveObject') {
            return {
              poolId: currentPoolId,
              network,
              poolData: pool.data.content.fields
            };
          }
        }
      }
    } catch (error) {
      // Network not available or object doesn't exist
      return null;
    }
    
    return null;
  }
  
  static async findLatestPool(registryId?: string): Promise<PoolDiscoveryResult | null> {
    const targetRegistryId = registryId || JACKPOT_CONFIG.GAME_REGISTRY;
    
    if (!targetRegistryId) {
      console.error('❌ No registry ID provided');
      return null;
    }
    
    console.log('🔍 Discovering latest pool for registry:', targetRegistryId);
    
    // Try testnet first since that's where our contract is deployed
    const networks: ('devnet' | 'testnet' | 'mainnet')[] = ['testnet', 'devnet', 'mainnet'];
    
    for (const network of networks) {
      console.log(`🌐 Checking ${network}...`);
      const result = await this.tryNetwork(network, targetRegistryId);
      
      if (result) {
        console.log(`✅ Found active pool on ${network}:`, result.poolId);
        console.log('📊 Pool details:', {
          round: result.poolData.round_number,
          total_pool: result.poolData.total_pool,
          state: result.poolData.state,
          tickets: result.poolData.total_ticket_count
        });
        return result;
      }
    }
    
    console.warn('⚠️ No active pool found on any network');
    return null;
  }
  
  static async validatePoolExists(poolId: string, network?: 'devnet' | 'testnet' | 'mainnet'): Promise<boolean> {
    const networks = network ? [network] : ['devnet', 'testnet', 'mainnet'] as const;
    
    for (const net of networks) {
      try {
        const client = new SuiClient({
          url: getFullnodeUrl(net)
        });
        
        const pool = await client.getObject({
          id: poolId,
          options: { showContent: true }
        });
        
        if (pool.data?.content?.dataType === 'moveObject') {
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    return false;
  }
}