// Define an interface for the table entry data
export interface TableEntry {
    id: string,
    vault: string;
    total: number;
    today: number;
    activeDays: number;
    followers: number;
    equity: number;
}

// Define an interface for the possible keys of TableEntry
export type TableEntryKeys = keyof TableEntry;