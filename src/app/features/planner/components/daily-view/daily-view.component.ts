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
  imports: [CommonModule, FormsModule, RouterModule, ReflectionListComponent],
  templateUrl: './daily-view.component.html',
  styleUrls: ['./daily-view.component.scss']
})
export class DailyViewComponent implements OnInit {
  currentDate: Date = new Date();
  plannerItems: PlannerItem[] = [];
  notes: Note[] = [];
  reflections: Reflection[] = [];
  
  // Form fields for new items
  newActivity: PlannerItem = this.createEmptyPlannerItem();
  newNote: Note = this.createEmptyNote();
  newReflection: Reflection = this.createEmptyReflection();
  
  // Time slots for scheduling
  timeSlots: string[] = [];
  
  // Editing states
  editingItemId: string | null = null;
  editingNoteId: string | null = null;
  editingReflectionId: string | null = null;
  
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
    
    // Set the correct date and time
    this.newActivity.date = new Date(this.currentDate);
    
    // Handle time strings
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    
    // Extract hours and minutes from the time string (HH:MM)
    if (this.newActivity.startTime) {
      startTime = new Date(this.newActivity.date);
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
    
    if (this.newActivity.endTime) {
      endTime = new Date(this.newActivity.date);
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
      this.newActivity = this.createEmptyPlannerItem();
    });
  }

  updatePlannerItem(item: PlannerItem): void {
    // For time string to Date conversion
    if (typeof item.startTime === 'string') {
      const startTime = new Date(item.date);
      const timeComponents = (item.startTime as string).split(':');
      const hours = parseInt(timeComponents[0], 10);
      const minutes = parseInt(timeComponents[1], 10);
      startTime.setHours(hours, minutes, 0, 0);
      item.startTime = startTime;
    }
    
    if (typeof item.endTime === 'string') {
      const endTime = new Date(item.date);
      const timeComponents = (item.endTime as string).split(':');
      const hours = parseInt(timeComponents[0], 10);
      const minutes = parseInt(timeComponents[1], 10);
      endTime.setHours(hours, minutes, 0, 0);
      item.endTime = endTime;
    }
    
    this.plannerService.updateItem(item)
      .subscribe(() => {
        this.loadDayData();
        this.editingItemId = null;
      });
  }

  deletePlannerItem(id: string): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.plannerService.deleteItem(id)
        .subscribe(() => {
          this.loadDayData();
        });
    }
  }

  toggleItemCompletion(item: PlannerItem): void {
    this.plannerService.toggleItemCompletion(item)
      .subscribe(() => {
        this.loadDayData();
      });
  }

  // Note methods
  createEmptyNote(): Note {
    return {
      id: '',
      content: '',
      date: new Date(this.currentDate)
    };
  }

  addNote(): void {
    if (!this.newNote.content.trim()) return;
    
    this.newNote.date = new Date(this.currentDate);
    
    this.notesService.createNote({
      content: this.newNote.content,
      date: this.newNote.date,
      tags: this.newNote.tags
    }).subscribe(() => {
      this.loadDayData();
      this.newNote = this.createEmptyNote();
    });
  }

  updateNote(note: Note): void {
    this.notesService.updateNote(note)
      .subscribe(() => {
        this.loadDayData();
        this.editingNoteId = null;
      });
  }

  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id)
        .subscribe(() => {
          this.loadDayData();
        });
    }
  }

  // Reflection methods
  createEmptyReflection(): Reflection {
    return {
      id: '',
      date: new Date(this.currentDate),
      content: '',
      lessons: '',
      improvements: ''
    };
  }

  addReflection(): void {
    if (!this.newReflection.content.trim()) return;
    
    this.newReflection.date = new Date(this.currentDate);
    
    this.reflectionService.createReflection({
      date: this.newReflection.date,
      content: this.newReflection.content,
      lessons: this.newReflection.lessons,
      improvements: this.newReflection.improvements,
      activityId: this.newReflection.activityId
    }).subscribe(() => {
      this.loadDayData();
      this.newReflection = this.createEmptyReflection();
    });
  }

  updateReflection(reflection: Reflection): void {
    this.reflectionService.updateReflection(reflection)
      .subscribe(() => {
        this.loadDayData();
        this.editingReflectionId = null;
      });
  }

  deleteReflection(id: string): void {
    if (confirm('Are you sure you want to delete this reflection?')) {
      this.reflectionService.deleteReflection(id)
        .subscribe(() => {
          this.loadDayData();
        });
    }
  }

  // Helper methods
  getPriorityClass(priority: number | undefined): string {
    return this.priorityService.getPriorityCssClass(priority);
  }

  getFormattedTimeForInput(date: Date | undefined): string {
    if (!date) return '';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  getActivityTitle(activityId: string | undefined): string {
    if (!activityId) return 'Unknown activity';
    
    const activity = this.plannerItems.find(item => item.id === activityId);
    return activity ? activity.title : 'Unknown activity';
  }
  
  // Safer methods for managing editing states
  setEditingReflectionId(id: string): void {
    this.editingReflectionId = id;
  }
  
  clearEditingReflectionId(): void {
    this.editingReflectionId = null;
  }

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