import { Injectable } from '@angular/core';

export interface PriorityLevel {
  name: string;
  minValue: number;
  maxValue: number;
  color: string;
  cssClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class PriorityService {
  // Define priority levels
  readonly priorityLevels: PriorityLevel[] = [
    {
      name: 'Critical',
      minValue: 90,
      maxValue: 100,
      color: '#dc3545', // Bootstrap danger red
      cssClass: 'priority-critical'
    },
    {
      name: 'High',
      minValue: 70,
      maxValue: 89,
      color: '#fd7e14', // Bootstrap orange
      cssClass: 'priority-high'
    },
    {
      name: 'Medium',
      minValue: 40,
      maxValue: 69,
      color: '#ffc107', // Bootstrap warning yellow
      cssClass: 'priority-medium'
    },
    {
      name: 'Low',
      minValue: 10,
      maxValue: 39,
      color: '#28a745', // Bootstrap success green
      cssClass: 'priority-low'
    },
    {
      name: 'Optional',
      minValue: 1,
      maxValue: 9,
      color: '#6c757d', // Bootstrap secondary gray
      cssClass: 'priority-optional'
    },
    {
      name: 'None',
      minValue: 0,
      maxValue: 0,
      color: '#ced4da', // Light gray
      cssClass: 'priority-none'
    }
  ];

  constructor() {}

  getLevelForPriority(priority: number | undefined): PriorityLevel {
    if (priority === undefined || priority === null) {
      return this.priorityLevels.find(level => level.name === 'None')!;
    }

    // Ensure priority is within range
    const normalizedPriority = Math.max(0, Math.min(100, priority));
    
    // Find the appropriate priority level
    return this.priorityLevels.find(
      level => normalizedPriority >= level.minValue && normalizedPriority <= level.maxValue
    ) || this.priorityLevels.find(level => level.name === 'None')!;
  }

  getPriorityColor(priority: number | undefined): string {
    return this.getLevelForPriority(priority).color;
  }

  getPriorityCssClass(priority: number | undefined): string {
    return this.getLevelForPriority(priority).cssClass;
  }

  getPriorityName(priority: number | undefined): string {
    return this.getLevelForPriority(priority).name;
  }

  // Get styling for HTML elements based on priority
  getStyleForPriority(priority: number | undefined): Record<string, string> {
    const level = this.getLevelForPriority(priority);
    return {
      'border-left': `4px solid ${level.color}`
    };
  }

  // Get a visual progress bar representation for a priority value
  getPriorityProgressStyle(priority: number | undefined): Record<string, string> {
    if (priority === undefined || priority === null) {
      return { width: '0%' };
    }
    
    const normalizedPriority = Math.max(0, Math.min(100, priority));
    return {
      width: `${normalizedPriority}%`,
      backgroundColor: this.getPriorityColor(normalizedPriority)
    };
  }
}