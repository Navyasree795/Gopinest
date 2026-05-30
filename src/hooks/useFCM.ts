import { useEffect, useCallback } from 'react';
import { requestForToken } from '../lib/firebase';
import { saveFcmToken } from '../lib/api';

export const useFCM = (isAuthenticated: boolean) => {
  const handleTokenSetup = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await requestForToken();
      if (token) {
        await saveFcmToken(token);
        console.log('FCM token registered successfully');
      }
    } catch (error) {
      console.error('Error in FCM token registration:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      handleTokenSetup();
    }
  }, [isAuthenticated, handleTokenSetup]);
};
