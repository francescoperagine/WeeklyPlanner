export interface PlannerItem {
    id: string;
    title: string;
    description?: string;
    date: Date;
    startTime?: Date;
    endTime?: Date;
    completed: boolean;
    priority?: number; // 0-100 percentage
    tags?: string[];
  }