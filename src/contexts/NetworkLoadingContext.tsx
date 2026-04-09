import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NetworkAwareLoader } from '@/components/ui/network-aware-loader';

interface NetworkLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NetworkLoadingContext = createContext<NetworkLoadingContextType | undefined>(undefined);

export function NetworkLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return (
    <NetworkLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <NetworkAwareLoader isLoading={isLoading} variant="minimal" />
    </NetworkLoadingContext.Provider>
  );
}

export function useNetworkLoading() {
  const context = useContext(NetworkLoadingContext);
  if (!context) {
    throw new Error('useNetworkLoading must be used within a NetworkLoadingProvider');
  }
  return context;
}
