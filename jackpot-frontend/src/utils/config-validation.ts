import { JACKPOT_CONFIG } from '../config/jackpot';

export function validateConfig() {
  const requiredFields = [
    { name: 'PACKAGE_ID', value: JACKPOT_CONFIG.PACKAGE_ID },
    { name: 'ADMIN_CAP', value: JACKPOT_CONFIG.ADMIN_CAP },
    { name: 'GAME_REGISTRY', value: JACKPOT_CONFIG.GAME_REGISTRY },
    { name: 'ROUND_HISTORY', value: JACKPOT_CONFIG.ROUND_HISTORY },
  ];

  const missingFields = requiredFields.filter(field => !field.value);

  if (missingFields.length > 0) {
    console.error('❌ Missing required configuration:');
    missingFields.forEach(field => {
      console.error(`   - ${field.name}`);
    });
    console.error('\n📝 Please ensure your .env file contains all required values.');
    console.error('   Run the deploy-and-configure.sh script to automatically set up the configuration.');
    return false;
  }

  console.log('✅ Configuration validated successfully');
  console.log('📦 Package ID:', JACKPOT_CONFIG.PACKAGE_ID);
  console.log('🎮 Game Registry:', JACKPOT_CONFIG.GAME_REGISTRY);
  console.log('🎰 Current Pool:', JACKPOT_CONFIG.CURRENT_POOL || 'Not set (create initial pool first)');
  
  return true;
}

export function isConfigured(): boolean {
  return !!(
    JACKPOT_CONFIG.PACKAGE_ID &&
    JACKPOT_CONFIG.ADMIN_CAP &&
    JACKPOT_CONFIG.GAME_REGISTRY &&
    JACKPOT_CONFIG.ROUND_HISTORY
  );
}