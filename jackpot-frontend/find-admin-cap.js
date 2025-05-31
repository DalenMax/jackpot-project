#!/usr/bin/env node

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const PACKAGE_ID = "0x7985c9350947ca5c3f5949c93913c6c0a0f4f67a708c8a549893772fcb228ce6";

async function findAdminCap() {
    const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
    });

    console.log('🔍 Searching for AdminCap objects...\n');

    try {
        // Look for AdminCap objects from this package
        const adminCapType = `${PACKAGE_ID}::jackpot_contract::AdminCap`;
        
        const objects = await client.getOwnedObjects({
            owner: '0x0', // This won't work, we need the actual deployer address
            filter: {
                StructType: adminCapType
            },
            options: {
                showContent: true,
                showType: true,
            }
        });

        if (objects.data.length > 0) {
            console.log('✅ Found AdminCap objects:');
            objects.data.forEach((obj, index) => {
                console.log(`   ${index + 1}. Object ID: ${obj.data?.objectId}`);
                console.log(`      Owner: ${obj.data?.owner}`);
                console.log(`      Type: ${obj.data?.type}`);
            });
        } else {
            console.log('❌ No AdminCap objects found');
            console.log('\n💡 To find AdminCap:');
            console.log('1. Check the transaction that deployed the contract');
            console.log('2. Look for objects created during deployment');
            console.log('3. The AdminCap was transferred to the deployer address');
            console.log('\n📝 Alternative: Use Sui Explorer to search for objects of type:');
            console.log(`   ${adminCapType}`);
        }

    } catch (err) {
        console.error('❌ Error searching for AdminCap:', err.message);
        
        console.log('\n💡 Try this CLI command to find objects:');
        console.log(`sui client objects --filter-type ${PACKAGE_ID}::jackpot_contract::AdminCap`);
    }
}

findAdminCap().catch(console.error);