#!/usr/bin/env node

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const PACKAGE_ID = "0x7985c9350947ca5c3f5949c93913c6c0a0f4f67a708c8a549893772fcb228ce6";
const REGISTRY_ID = "0xf08234a5462b5b9e398de0e213a09f58d7b4e5e6ae7840258be0ebf057666f3e";

async function testContract() {
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    console.log('🚀 Testing SuiJackpot Contract Integration...\n');

    try {
        // Test 1: Check if package exists
        console.log('📦 Testing package existence...');
        try {
            const packageInfo = await client.getNormalizedMoveModulesByPackage({
                package: PACKAGE_ID,
            });
            console.log('✅ Package found with modules:', Object.keys(packageInfo));
        } catch (err) {
            console.log('❌ Package not found or error:', err.message);
            return;
        }

        // Test 2: Check registry object
        console.log('\n📋 Testing registry object...');
        try {
            const registry = await client.getObject({
                id: REGISTRY_ID,
                options: {
                    showContent: true,
                    showType: true,
                }
            });

            if (registry.data && registry.data.content) {
                console.log('✅ Registry found!');
                console.log('   Type:', registry.data.type);
                
                if (registry.data.content.dataType === 'moveObject') {
                    const fields = registry.data.content.fields;
                    console.log('   Current Round:', fields.current_round);
                    console.log('   Current Pool ID:', fields.current_pool_id?.fields?.some || 'None');
                }
            } else {
                console.log('❌ Registry object not found or has no content');
            }
        } catch (err) {
            console.log('❌ Error fetching registry:', err.message);
        }

        // Test 3: Check if there's an active pool
        console.log('\n🎰 Checking for active lottery pool...');
        try {
            const registry = await client.getObject({
                id: REGISTRY_ID,
                options: { showContent: true }
            });

            if (registry.data?.content?.dataType === 'moveObject') {
                const fields = registry.data.content.fields;
                const currentPoolId = fields.current_pool_id?.fields?.some;

                if (currentPoolId) {
                    console.log('✅ Current pool ID found:', currentPoolId);
                    
                    // Try to fetch the pool
                    const pool = await client.getObject({
                        id: currentPoolId,
                        options: { showContent: true }
                    });

                    if (pool.data?.content?.dataType === 'moveObject') {
                        const poolFields = pool.data.content.fields;
                        console.log('   Round Number:', poolFields.round_number);
                        console.log('   State:', poolFields.state);
                        console.log('   Total Pool:', (parseInt(poolFields.total_pool) / 1_000_000_000), 'SUI');
                        console.log('   Total Tickets:', poolFields.total_ticket_count);
                        console.log('   Start Time:', new Date(parseInt(poolFields.start_time)));
                        console.log('   End Time:', new Date(parseInt(poolFields.end_time)));
                    }
                } else {
                    console.log('⚠️  No current pool set in registry');
                }
            }
        } catch (err) {
            console.log('❌ Error checking pool:', err.message);
        }

        // Test 4: Check events
        console.log('\n📡 Checking recent events...');
        try {
            const events = await client.queryEvents({
                query: {
                    MoveModule: {
                        package: PACKAGE_ID,
                        module: 'jackpot_contract',
                    }
                },
                limit: 10,
                order: 'descending',
            });

            console.log(`✅ Found ${events.data.length} recent events:`);
            events.data.forEach((event, index) => {
                const eventType = event.type.split('::').pop();
                console.log(`   ${index + 1}. ${eventType} - ${new Date(parseInt(event.timestampMs || '0'))}`);
            });
        } catch (err) {
            console.log('❌ Error fetching events:', err.message);
        }

        console.log('\n🎉 Contract integration test completed!');
        console.log('\n💡 Next steps:');
        console.log('1. If no active pool exists, create one using create_initial_pool');
        console.log('2. Open http://localhost:5173 to test the frontend');
        console.log('3. Connect your wallet and try the "Run Tests" button');

    } catch (err) {
        console.error('❌ Fatal error:', err);
    }
}

testContract().catch(console.error);