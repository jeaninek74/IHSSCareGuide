import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { subscriptionApi, SubscriptionStatus } from '../services/apiClient';
import { useAuth } from './AuthContext';

interface SubscriptionContextValue {
  subscription: SubscriptionStatus | null;
  isSubscribed: boolean;
  isLoadingSubscription: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setIsLoadingSubscription(false);
      return;
    }
    try {
      const res = await subscriptionApi.getStatus();
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      refreshSubscription();
    }
  }, [authLoading, refreshSubscription]);

  const isSubscribed = subscription?.isActive ?? false;

  return (
    <SubscriptionContext.Provider value={{ subscription, isSubscribed, isLoadingSubscription, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextValue => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
