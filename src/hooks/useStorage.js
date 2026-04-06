import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage(key, initial) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    AsyncStorage.getItem(key).then(stored => {
      if (stored !== null) {
        try { setValue(JSON.parse(stored)); } catch {}
      }
    });
  }, [key]);

  const set = (nextOrFn) => {
    setValue(prev => {
      const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn;
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return [value, set];
}
