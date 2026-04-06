import { useState } from 'react';

export function useStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = (next) => {
    const resolved = typeof next === 'function' ? next(value) : next;
    setValue(resolved);
    try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
  };

  return [value, set];
}
