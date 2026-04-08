import { useStorage } from './useStorage';

export function useBodyWeight() {
  return useStorage('bodyWeightLog', []);
}
