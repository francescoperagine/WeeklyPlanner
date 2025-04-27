export interface TodoItem {
    id: string;
    title: string;
    description?: string;
    priority?: number;
    completed: boolean;
    dueDate?: Date;
  }