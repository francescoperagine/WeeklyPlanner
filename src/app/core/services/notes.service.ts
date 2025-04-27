import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from '@core/services/storage.service';
import { Note } from '@shared/models/note.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private readonly storeName = 'notes';

  constructor(private storageService: StorageService) {}

  createNote(note: Omit<Note, 'id'>): Observable<Note> {
    const newNote: Note = {
      ...note,
      id: uuidv4()
    };
    return this.storageService.create<Note>(this.storeName, newNote);
  }

  getNoteById(id: string): Observable<Note | null> {
    return this.storageService.getById<Note>(this.storeName, id);
  }

  getAllNotes(): Observable<Note[]> {
    return this.storageService.getAll<Note>(this.storeName);
  }

  updateNote(note: Note): Observable<Note> {
    return this.storageService.update<Note>(this.storeName, note);
  }

  deleteNote(id: string): Observable<boolean> {
    return this.storageService.delete(this.storeName, id);
  }

  getNotesForDate(date: Date): Observable<Note[]> {
    // Create a date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<Note>(
      this.storeName,
      'date',
      startDate,
      endDate
    );
  }

  getNotesForDateRange(startDate: Date, endDate: Date): Observable<Note[]> {
    // Ensure we capture the full days
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<Note>(
      this.storeName,
      'date',
      start,
      end
    );
  }

  getNotesWithTag(tag: string): Observable<Note[]> {
    // This would require a custom query or filtering
    // For now, we'll use a simpler approach by getting all notes and filtering
    return this.getAllNotes().pipe(
      map(notes => notes.filter(note => note.tags?.includes(tag)))
    );
  }
}