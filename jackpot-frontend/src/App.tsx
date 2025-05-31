import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnection } from './components/WalletConnection';
import { JackpotGame } from './components/JackpotGame';
import { ContractTest } from './components/ContractTest';
import { ActivityFeed } from './components/ActivityFeed';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-700 bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                🎰 SuiJackpot
              </h1>
              <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full border border-success/30">
                TESTNET
              </span>
            </div>
            <div className="text-sm text-gray-300">
              10-minute lottery on Sui blockchain
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Wallet Connection */}
          <WalletConnection />

          {/* Admin Panel */}
          <AdminPanel />

          {/* Contract Tests */}
          <ContractTest />

          {/* Game Interface */}
          {currentAccount ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <JackpotGame />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to SuiJackpot! 🎰
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                A transparent, decentralized lottery game on Sui blockchain. 
                Every 10 minutes, one lucky player wins 90% of the prize pool!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-surface p-6 rounded-lg border border-gray-700">
                  <div className="text-primary text-2xl mb-2">⚡</div>
                  <h3 className="font-bold text-white mb-2">Fast Rounds</h3>
                  <p className="text-gray-300 text-sm">
                    New lottery round every 10 minutes for instant excitement
                  </p>
                </div>
                
                <div className="bg-surface p-6 rounded-lg border border-gray-700">
                  <div className="text-accent text-2xl mb-2">🔍</div>
                  <h3 className="font-bold text-white mb-2">Transparent</h3>
                  <p className="text-gray-300 text-sm">
                    All draws use Sui's native randomness for fair results
                  </p>
                </div>
                
                <div className="bg-surface p-6 rounded-lg border border-gray-700">
                  <div className="text-success text-2xl mb-2">💰</div>
                  <h3 className="font-bold text-white mb-2">Big Prizes</h3>
                  <p className="text-gray-300 text-sm">
                    Winner takes 90% of the pool, plus 5% airdrops to participants
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-surface mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>SuiJackpot - Built on Sui Blockchain</p>
            <p className="mt-1">Play responsibly • Powered by Sui's native randomness</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
