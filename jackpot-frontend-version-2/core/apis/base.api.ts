import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export class BaseApi {
    protected static suiClient = new SuiClient({
        url: getFullnodeUrl('devnet'), // Using devnet to match deployed contract
    });

    protected static formatSuiAmount(amount: string | number): number {
        // Convert from MIST to SUI (divide by 10^9)
        return typeof amount === 'string' ? 
            parseInt(amount, 10) / 1_000_000_000 : 
            amount / 1_000_000_000;
    }

    protected static formatMistAmount(suiAmount: number): number {
        // Convert from SUI to MIST (multiply by 10^9)
        return Math.floor(suiAmount * 1_000_000_000);
    }
}