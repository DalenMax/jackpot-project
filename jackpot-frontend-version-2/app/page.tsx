"use client";

import { useEffect, useState } from 'react';
import { validateConfig } from '../utils/config-validation';
import { NoSSR } from '../components/no-ssr';
import dynamic from 'next/dynamic';

// Dynamic imports with SSR disabled for wallet-dependent components
const JackpotGame = dynamic(() => import('../components/jackpot-game').then(mod => ({ default: mod.JackpotGame })), { 
  ssr: false,
  loading: () => <div className="glass-panel text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div></div>
});

export default function Home() {
  return (
    <NoSSR 
      fallback={
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      }
    >
      <HomeContent />
    </NoSSR>
  );
}

function HomeContent() {
  const [configValid, setConfigValid] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Validate configuration on startup
    const isValid = validateConfig();
    setConfigValid(isValid);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  // Show configuration error if not properly configured
  if (!configValid) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center">
        <div className="max-w-2xl w-full p-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Configuration Error</h2>
            <p className="text-gray-300 mb-4">
              The jackpot contract configuration is missing. Please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Navigate to the contract directory: <code className="bg-gray-800 px-2 py-1 rounded">cd jackpot_contract</code></li>
              <li>Run the deployment script: <code className="bg-gray-800 px-2 py-1 rounded">./deploy-and-configure.sh</code></li>
              <li>The script will automatically create a .env file with the contract addresses</li>
              <li>Restart the frontend development server</li>
            </ol>
            <div className="mt-6 p-4 bg-gray-800 rounded">
              <p className="text-sm text-gray-400 mb-2">Check the browser console for specific missing values.</p>
              <p className="text-sm text-gray-400">If you have already deployed the contract, create a <code>.env.local</code> file in the frontend directory based on <code>.env.example</code></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always show the enhanced game interface (wallet connection is handled within)
  return <JackpotGame />;
}
