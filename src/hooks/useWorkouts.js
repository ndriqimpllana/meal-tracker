import { useStorage } from "./useStorage";

export function useWorkouts() {
    return useStorage('workoutPlan', {});
}

export function useWorkoutLogs() {
    return useStorage('workoutLogs', {});
}