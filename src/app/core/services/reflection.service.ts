// src/app/core/services/reflection.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { Reflection } from '@shared/models/reflection.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ReflectionService {
  private readonly storeName = 'reflections';

  constructor(private storageService: StorageService) {}

  createReflection(reflection: Omit<Reflection, 'id'>): Observable<Reflection> {
    const newReflection: Reflection = {
      ...reflection,
      id: uuidv4()
    };
    return this.storageService.create<Reflection>(this.storeName, newReflection);
  }

  getReflectionById(id: string): Observable<Reflection | null> {
    return this.storageService.getById<Reflection>(this.storeName, id);
  }

  getAllReflections(): Observable<Reflection[]> {
    return this.storageService.getAll<Reflection>(this.storeName);
  }

  updateReflection(reflection: Reflection): Observable<Reflection> {
    return this.storageService.update<Reflection>(this.storeName, reflection);
  }

  deleteReflection(id: string): Observable<boolean> {
    return this.storageService.delete(this.storeName, id);
  }

  getReflectionsForDate(date: Date): Observable<Reflection[]> {
    // Create a date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<Reflection>(
      this.storeName,
      'date',
      startDate,
      endDate
    );
  }

  getReflectionsForDateRange(startDate: Date, endDate: Date): Observable<Reflection[]> {
    // Ensure we capture the full days
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<Reflection>(
      this.storeName,
      'date',
      start,
      end
    );
  }

  getReflectionsForActivity(activityId: string): Observable<Reflection[]> {
    return this.storageService.queryByIndex<Reflection>(
      this.storeName,
      'activityId',
      activityId
    );
  }
}