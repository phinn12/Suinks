import React from 'react'
import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, type EnokiWallet, type AuthProvider } from '@mysten/enoki';

interface ZkLoginButtonProps {
  onSuccess?: (address: string) => void
  onError?: (error: Error) => void
}

export function ZkLoginButton({ onSuccess, onError }: ZkLoginButtonProps) {
  const currentAccount = useCurrentAccount();
  const connectWallet = useConnectWallet();

  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  const googleWallet = walletsByProvider.get('google');

  // Call onSuccess when account changes
  React.useEffect(() => {
    if (currentAccount && onSuccess) {
      console.log('zkLogin success! Address:', currentAccount.address);
      onSuccess(currentAccount.address);
    }
  }, [currentAccount, onSuccess]);

  const handleGoogleConnect = async () => {
    try {
      if (!googleWallet) {
        throw new Error('Google wallet not available');
      }
      
      // Use redirect flow instead of popup to avoid popup blockers
      await connectWallet.mutateAsync({ 
        wallet: googleWallet,
      });
    } catch (error) {
      console.error('Google connect error:', error);
      
      // If popup is blocked, show user-friendly message
      if (error instanceof Error && error.message.includes('Popup closed')) {
        alert('Popup was blocked or closed. Please allow popups for this site and try again.');
      }
      
      onError?.(error as Error);
    }
  };

  if (currentAccount) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg">
          <div className="text-sm font-medium">Connected with zkLogin</div>
          <div className="text-xs font-mono break-all">
            {currentAccount.address.substring(0, 20)}...{currentAccount.address.substring(currentAccount.address.length - 8)}
          </div>
        </div>
        <div className="text-white/60 text-sm text-center max-w-xs">
          Real Sui address via Enoki zkLogin
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {googleWallet ? (
        <button
          onClick={handleGoogleConnect}
          className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 border border-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      ) : (
        <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg">
          <div className="text-sm">Enoki wallets loading...</div>
        </div>
      )}
      
      <div className="text-white/60 text-sm text-center max-w-xs">
        Sign in with Google to create your real Sui address via Enoki zkLogin
      </div>
    </div>
  );
}