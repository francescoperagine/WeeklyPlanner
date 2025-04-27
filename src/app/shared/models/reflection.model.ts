export interface Reflection {
    id: string;
    activityId?: string; // Reference to a PlannerItem
    date: Date;
    content: string;
    lessons?: string;
    improvements?: string;
  }