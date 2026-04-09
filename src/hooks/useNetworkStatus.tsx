import { useState, useEffect, useCallback } from 'react';

export type ConnectionSpeed = 'fast' | 'moderate' | 'slow' | 'offline';

interface NetworkStatus {
  isOnline: boolean;
  connectionSpeed: ConnectionSpeed;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

const getConnection = (): NetworkInformation | null => {
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

const getConnectionSpeed = (connection: NetworkInformation | null): ConnectionSpeed => {
  if (!navigator.onLine) return 'offline';
  if (!connection) return 'fast'; // Assume fast if API not supported
  
  const { effectiveType, rtt, downlink } = connection;
  
  // Check effective connection type first
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g') {
    return 'moderate';
  }
  
  // Additional checks based on RTT and downlink
  if (rtt > 500 || downlink < 0.5) {
    return 'slow';
  }
  
  if (rtt > 200 || downlink < 2) {
    return 'moderate';
  }
  
  return 'fast';
};

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    const connection = getConnection();
    return {
      isOnline: navigator.onLine,
      connectionSpeed: getConnectionSpeed(connection),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
    };
  });

  const updateNetworkStatus = useCallback(() => {
    const connection = getConnection();
    setStatus({
      isOnline: navigator.onLine,
      connectionSpeed: getConnectionSpeed(connection),
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false,
    });
  }, []);

  useEffect(() => {
    const connection = getConnection();
    
    // Listen for online/offline changes
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Listen for connection changes if API is available
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return status;
}
