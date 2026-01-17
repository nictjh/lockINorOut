import { writable } from 'svelte/store';

// Store to keep track of played level IDs in the current session
export const playedLevelIds = writable<string[]>([]);
