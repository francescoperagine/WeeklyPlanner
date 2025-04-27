// src/app/features/planner/components/daily-view/daily-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlannerService } from '@core/services/planner.service';
import { NotesService } from '@core/services/notes.service';
import { ReflectionService } from '@core/services/reflection.service';
import { PriorityService } from '@core/services/priority.service';
import { PlannerItem } from '@shared/models/planner-item.model';
import { Note } from '@shared/models/note.model';
import { Reflection } from '@shared/models/reflection.model';
import { ReflectionListComponent } from '@features/reflection/components/reflection-list/reflection-list.component';

@Component({
  selector: 'app-daily-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './daily-view.component.html',
  styleUrls: ['./daily-view.component.css']
})
export class DailyViewComponent implements OnInit {
  currentDate: Date = new Date();
  plannerItems: PlannerItem[] = [];
  notes: Note[] = [];
  reflections: Reflection[] = [];
  
  // New activity panel state
  showNewActivityPanel: boolean = false;
  
  // Form fields for new items
  newActivity: PlannerItem = this.createEmptyPlannerItem();
  newNote: Note = this.createEmptyNote();
  
  // Time slots for scheduling
  timeSlots: string[] = [];
  
  // Hours for the day view
  hoursOfDay: number[] = Array.from({ length: 24 }, (_, i) => i);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plannerService: PlannerService,
    private notesService: NotesService,
    private reflectionService: ReflectionService,
    public priorityService: PriorityService
  ) {
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['date']) {
        this.currentDate = new Date(params['date']);
      } else {
        this.currentDate = new Date();
      }
      
      this.loadDayData();
    });
  }

  private generateTimeSlots(): void {
    for (let hour = 0; hour < 24; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      this.timeSlots.push(`${hourFormatted}:00`);
      this.timeSlots.push(`${hourFormatted}:30`);
    }
  }

  private loadDayData(): void {
    // Load planner items
    this.plannerService.getItemsForDate(this.currentDate)
      .subscribe(items => {
        this.plannerItems = items;
      });
    
    // Load notes
    this.notesService.getNotesForDate(this.currentDate)
      .subscribe(notes => {
        this.notes = notes;
      });
    
    // Load reflections
    this.reflectionService.getReflectionsForDate(this.currentDate)
      .subscribe(reflections => {
        this.reflections = reflections;
      });
  }

  navigateToPreviousDay(): void {
    const previousDay = new Date(this.currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    this.router.navigate(['/planner/day', this.formatDateForUrl(previousDay)]);
  }

  navigateToNextDay(): void {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.router.navigate(['/planner/day', this.formatDateForUrl(nextDay)]);
  }

  navigateToToday(): void {
    this.router.navigate(['/planner/day', this.formatDateForUrl(new Date())]);
  }

  private formatDateForUrl(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // New methods for the calendar-like view
  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  isToday(): boolean {
    const today = new Date();
    return (
      this.currentDate.getDate() === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Calculate position based on hours and minutes
    // Each hour is 60px height (defined in CSS)
    return (hours * 60) + (minutes); 
  }

  getAllDayItems(): PlannerItem[] {
    return this.plannerItems.filter(item => {
      // Consider an item "all day" if it has no specific start/end time
      return !item.startTime && !item.endTime;
    });
  }

  getItemsForHour(hour: number): PlannerItem[] {
    return this.plannerItems.filter(item => {
      if (!item.startTime) return false;
      
      const itemDate = new Date(item.startTime);
      return itemDate.getHours() === hour && itemDate.getMinutes() < 30;
    });
  }

  getItemsForHalfHour(hour: number): PlannerItem[] {
    return this.plannerItems.filter(item => {
      if (!item.startTime) return false;
      
      const itemDate = new Date(item.startTime);
      return itemDate.getHours() === hour && itemDate.getMinutes() >= 30;
    });
  }

  calculateEventHeight(item: PlannerItem): number {
    if (!item.startTime || !item.endTime) return 60; // Default height
    
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);
    
    // Calculate duration in minutes
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    // Return height based on duration (1 minute = 1px)
    return Math.max(24, durationMinutes); // Minimum height of 24px
  }

  // Activity panel methods
  openNewActivityPanel(hour?: number, minutes?: number): void {
    this.newActivity = this.createEmptyPlannerItem();
    
    // If hour is provided, set the start and end times
    if (hour !== undefined) {
      const startDate = new Date(this.currentDate);
      startDate.setHours(hour, minutes || 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(hour + 1, minutes || 0, 0, 0);
      
      this.newActivity.startTime = startDate;
      this.newActivity.endTime = endDate;
    }
    
    this.showNewActivityPanel = true;
  }

  closeNewActivityPanel(): void {
    this.showNewActivityPanel = false;
  }

  // Planner item methods
  createEmptyPlannerItem(): PlannerItem {
    return {
      id: '',
      title: '',
      date: new Date(this.currentDate),
      completed: false,
      priority: 50
    };
  }

  addPlannerItem(): void {
    if (!this.newActivity.title.trim()) return;
    
    // Set the correct date
    this.newActivity.date = new Date(this.currentDate);
    
    // Handle time strings if needed
    let startTime: Date | undefined = this.newActivity.startTime;
    let endTime: Date | undefined = this.newActivity.endTime;
    
    // If times are strings, convert them
    if (typeof this.newActivity.startTime === 'string') {
      startTime = new Date(this.currentDate);
      const startTimeStr = this.newActivity.startTime as unknown as string;
      if (typeof startTimeStr === 'string') {
        const timeComponents = startTimeStr.split(':');
        if (timeComponents.length === 2) {
          const hours = parseInt(timeComponents[0], 10);
          const minutes = parseInt(timeComponents[1], 10);
          startTime.setHours(hours, minutes, 0, 0);
        }
      }
    }
    
    if (typeof this.newActivity.endTime === 'string') {
      endTime = new Date(this.currentDate);
      const endTimeStr = this.newActivity.endTime as unknown as string;
      if (typeof endTimeStr === 'string') {
        const timeComponents = endTimeStr.split(':');
        if (timeComponents.length === 2) {
          const hours = parseInt(timeComponents[0], 10);
          const minutes = parseInt(timeComponents[1], 10);
          endTime.setHours(hours, minutes, 0, 0);
        }
      }
    }
    
    this.plannerService.createItem({
      title: this.newActivity.title,
      description: this.newActivity.description,
      date: this.newActivity.date,
      startTime: startTime,
      endTime: endTime,
      completed: false,
      priority: this.newActivity.priority,
      tags: this.newActivity.tags
    }).subscribe(() => {
      this.loadDayData();
      this.closeNewActivityPanel();
    });
  }

  // Helper methods
  getPriorityClass(priority: number | undefined): string {
    return this.priorityService.getPriorityCssClass(priority);
  }

  // Note methods
  createEmptyNote(): Note {
    return {
      id: '',
      content: '',
      date: new Date(this.currentDate)
    };
  }

  // Event handlers for reflection component
  onReflectionAdded(reflection: Reflection): void {
    this.reflectionService.createReflection(reflection)
      .subscribe(() => {
        this.loadDayData();
      });
  }

  onReflectionUpdated(reflection: Reflection): void {
    this.reflectionService.updateReflection(reflection)
      .subscribe(() => {
        this.loadDayData();
      });
  }

  onReflectionDeleted(id: string): void {
    this.reflectionService.deleteReflection(id)
      .subscribe(() => {
        this.loadDayData();
      });
  }
}