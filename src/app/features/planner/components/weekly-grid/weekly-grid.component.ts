// weekly-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '@core/services/planner.service';
import { PlannerItem } from '@shared/models/planner-item.model';

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './weekly-grid.component.html',
  styleUrls: ['./weekly-grid.component.scss']
})
export class WeeklyGridComponent implements OnInit {
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  currentWeekStart: Date = new Date();
  plannerItems: PlannerItem[] = [];
  timeSlots: string[] = [];
  
  constructor(private plannerService: PlannerService) {
    // Set the start of the week to Monday
    this.setWeekStart();
    
    // Generate time slots (hourly from 6 AM to 10 PM)
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadWeekItems();
  }

  private setWeekStart(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  private generateTimeSlots(): void {
    for (let hour = 6; hour <= 22; hour++) {
      this.timeSlots.push(`${hour}:00`);
    }
  }

  loadWeekItems(): void {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    this.plannerService.getItemsForDateRange(this.currentWeekStart, endDate)
      .subscribe(items => {
        this.plannerItems = items;
      });
  }

  getItemsForDay(dayIndex: number): PlannerItem[] {
    const dayDate = new Date(this.currentWeekStart);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    return this.plannerItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getDate() === dayDate.getDate() &&
             itemDate.getMonth() === dayDate.getMonth() &&
             itemDate.getFullYear() === dayDate.getFullYear();
    });
  }

  getDayDate(dayIndex: number): Date {
    const date = new Date(this.currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  navigateToPreviousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.loadWeekItems();
  }

  navigateToNextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.loadWeekItems();
  }

  navigateToCurrentWeek(): void {
    this.setWeekStart();
    this.loadWeekItems();
  }

  createNewItem(dayIndex: number, timeSlot: string): void {
    const date = this.getDayDate(dayIndex);
    const [hours] = timeSlot.split(':').map(Number);
    date.setHours(hours, 0, 0, 0);
    
    // Navigate to create item or open dialog
    // This could dispatch to a service or open a modal
  }

  calculatePriorityClass(priority: number | undefined): string {
    if (!priority) return 'priority-none';
    
    if (priority < 30) return 'priority-low';
    if (priority < 70) return 'priority-medium';
    return 'priority-high';
  }
}