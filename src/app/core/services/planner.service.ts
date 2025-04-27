import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { PlannerItem } from '@shared/models/planner-item.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {
  private readonly storeName = 'plannerItems';

  constructor(private storageService: StorageService) {}

  createItem(item: Omit<PlannerItem, 'id'>): Observable<PlannerItem> {
    const newItem: PlannerItem = {
      ...item,
      id: uuidv4()
    };
    return this.storageService.create<PlannerItem>(this.storeName, newItem);
  }

  getItemById(id: string): Observable<PlannerItem | null> {
    return this.storageService.getById<PlannerItem>(this.storeName, id);
  }

  getAllItems(): Observable<PlannerItem[]> {
    return this.storageService.getAll<PlannerItem>(this.storeName);
  }

  updateItem(item: PlannerItem): Observable<PlannerItem> {
    return this.storageService.update<PlannerItem>(this.storeName, item);
  }

  deleteItem(id: string): Observable<boolean> {
    return this.storageService.delete(this.storeName, id);
  }

  getItemsForDate(date: Date): Observable<PlannerItem[]> {
    // Create a date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<PlannerItem>(
      this.storeName,
      'date',
      startDate,
      endDate
    );
  }

  getItemsForDateRange(startDate: Date, endDate: Date): Observable<PlannerItem[]> {
    // Ensure we capture the full days
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<PlannerItem>(
      this.storeName,
      'date',
      start,
      end
    );
  }

  toggleItemCompletion(item: PlannerItem): Observable<PlannerItem> {
    const updatedItem = {
      ...item,
      completed: !item.completed
    };
    return this.updateItem(updatedItem);
  }

  updateItemPriority(item: PlannerItem, priority: number): Observable<PlannerItem> {
    const updatedItem = {
      ...item,
      priority: Math.max(0, Math.min(100, priority)) // Ensure priority is between 0-100
    };
    return this.updateItem(updatedItem);
  }

  moveItemToDate(item: PlannerItem, newDate: Date): Observable<PlannerItem> {
    // Keep the same time but change the date
    const currentDate = new Date(item.date);
    const updatedDate = new Date(newDate);
    updatedDate.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
    
    const updatedItem = {
      ...item,
      date: updatedDate
    };
    return this.updateItem(updatedItem);
  }

  rescheduleItem(
    item: PlannerItem, 
    newDate: Date, 
    newStartTime: Date, 
    newEndTime?: Date
  ): Observable<PlannerItem> {
    const updatedItem = {
      ...item,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    };
    return this.updateItem(updatedItem);
  }
}