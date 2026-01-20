import {useState, useEffect, useCallback} from 'react';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Hook to monitor network connectivity status
 * In production, this would use @react-native-community/netinfo
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // In production, this would subscribe to NetInfo
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setNetworkStatus({
    //     isConnected: state.isConnected ?? false,
    //     isInternetReachable: state.isInternetReachable,
    //   });
    // });
    // return () => unsubscribe();

    // For now, simulate always connected
    setNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
    });
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    // In production: const state = await NetInfo.fetch();
    // return state.isConnected ?? false;
    return true;
  }, []);

  return {
    ...networkStatus,
    checkConnection,
  };
};

/**
 * Hook to handle offline-first operations
 */
export const useOfflineFirst = <T>(
  onlineAction: () => Promise<T>,
  offlineAction: () => Promise<T>,
  deps: unknown[] = []
) => {
  const {isConnected} = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = isConnected
        ? await onlineAction()
        : await offlineAction();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, ...deps]);

  return {
    execute,
    loading,
    error,
    data,
    isOffline: !isConnected,
  };
};
