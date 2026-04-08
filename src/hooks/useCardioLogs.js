import { useStorage } from './useStorage';

export function useCardioLogs() {
  return useStorage('cardioLogs', {});
}
