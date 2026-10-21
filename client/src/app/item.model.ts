export interface CampusItem { _id?: string; type: 'Lost' | 'Found'; name: string; category: string; location: string; date: string; description: string; contact: string; }
export interface ItemMatch { lost: CampusItem; found: CampusItem; score: number; reasons: string[]; }
