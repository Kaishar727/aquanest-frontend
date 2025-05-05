// src/hooks/useAuthSync.js
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase-config';

export function useAuthSync(callback) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user);
    });

    // Listen for storage events (changes from other tabs)
    const handleStorage = (e) => {
      if (e.key === 'firebase:authUser') {
        onAuthStateChanged(auth, callback);
      }
    };

    window.addEventListener('storage', handleStorage);
    
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [callback]);
}