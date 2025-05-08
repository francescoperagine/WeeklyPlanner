import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '@core/services/planner.service';
import { PlannerItem } from '@shared/models/planner-item.model';
import { ChevronLeftComponent } from '@shared/components/icons/chevron-left/chevron-left.component';
import { ChevronRightComponent } from '@shared/components/icons/chevron-right/chevron-right.component';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';

@Component({
  selector: 'app-weekly-grid',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ChevronLeftComponent, 
    ChevronRightComponent,
    IconButtonComponent
  ],
  templateUrl: './weekly-grid.component.html',
  styleUrls: ['./weekly-grid.component.css']
})
export class WeeklyGridComponent implements OnInit {
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  currentWeekStart: Date = new Date();
  plannerItems: PlannerItem[] = [];
  timeSlots: string[] = [];
  
  constructor(private plannerService: PlannerService) {
    // Set the start of the week to Monday
    this.setWeekStart();
    
    // Generate time slots (hourly from 00:00 to 23:00)
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
    // Start from 00:00 but we'll handle the display separately in the template
    for (let hour = 0; hour <= 23; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
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

  // Get all-day items for a specific day
  getAllDayItemsForDay(dayIndex: number): PlannerItem[] {
    return this.getItemsForDay(dayIndex).filter(item => 
      !item.startTime && !item.endTime // All-day items have no specific time
    );
  }

  // Get time-specific items for a specific day and time slot
  getTimeSpecificItemsForDay(dayIndex: number, timeSlot: string): PlannerItem[] {
    const itemsForDay = this.getItemsForDay(dayIndex);
    const [hours] = timeSlot.split(':').map(Number);
    
    return itemsForDay.filter(item => {
      if (!item.startTime) return false;
      
      const startHour = new Date(item.startTime).getHours();
      return startHour === hours;
    });
  }

  getDayDate(dayIndex: number): Date {
    const date = new Date(this.currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  navigateToPreviousWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime());
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.loadWeekItems();
  }
  
  navigateToNextWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime());
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.loadWeekItems();
  }

  navigateToCurrentWeek(): void {
    this.setWeekStart();
    this.loadWeekItems();
  }

  createNewItem(dayIndex: number, timeSlot: string | null = null): void {
    const date = this.getDayDate(dayIndex);
    
    if (timeSlot) {
      const [hours] = timeSlot.split(':').map(Number);
      date.setHours(hours, 0, 0, 0);
    }
    
    // Navigate to create item or open dialog
    // This could dispatch to a service or open a modal
  }

  calculatePriorityClass(priority: number | undefined): string {
    if (!priority) return 'bg-gray-100 border-l-[4px] border-l-[#ced4da]';
    
    if (priority < 30) return 'bg-[#d4edda] border-l-[4px] border-l-[#28a745]';
    if (priority < 70) return 'bg-[#fff3cd] border-l-[4px] border-l-[#ffc107]';
    return 'bg-[#f8d7da] border-l-[4px] border-l-[#dc3545]';
  }

  isWeekend(dayIndex: number): boolean {
    // Saturday is index 5, Sunday is index 6
    return dayIndex === 5 || dayIndex === 6;
  }

  getGMTOffset(): string {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(offset / 60));
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    
    return `${sign}${formattedHours}`;
  }

  // Helper to determine if we should show the time label
  shouldShowTimeLabel(timeSlot: string): boolean {
    return timeSlot !== '00:00'; // Hide 00:00 specifically
  }
}