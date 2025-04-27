// src/app/core/services/todo.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '@core/services/storage.service';
import { TodoItem } from '@shared/models/todo-item.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly storeName = 'todoItems';

  constructor(private storageService: StorageService) {}

  createTodo(todo: Omit<TodoItem, 'id'>): Observable<TodoItem> {
    const newTodo: TodoItem = {
      ...todo,
      id: uuidv4()
    };
    return this.storageService.create<TodoItem>(this.storeName, newTodo);
  }

  getTodoById(id: string): Observable<TodoItem | null> {
    return this.storageService.getById<TodoItem>(this.storeName, id);
  }

  getAllTodos(): Observable<TodoItem[]> {
    return this.storageService.getAll<TodoItem>(this.storeName);
  }

  updateTodo(todo: TodoItem): Observable<TodoItem> {
    return this.storageService.update<TodoItem>(this.storeName, todo);
  }

  deleteTodo(id: string): Observable<boolean> {
    return this.storageService.delete(this.storeName, id);
  }

  toggleTodoCompletion(todo: TodoItem): Observable<TodoItem> {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed
    };
    return this.updateTodo(updatedTodo);
  }

  updateTodoPriority(todo: TodoItem, priority: number): Observable<TodoItem> {
    const updatedTodo = {
      ...todo,
      priority: Math.max(0, Math.min(100, priority)) // Ensure priority is between 0-100
    };
    return this.updateTodo(updatedTodo);
  }

  getTodosByDueDate(dueDate?: Date): Observable<TodoItem[]> {
    if (!dueDate) {
      // If no dueDate provided, return all todos
      return this.getAllTodos();
    }
    
    // Create a date range for the entire day
    const startDate = new Date(dueDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dueDate);
    endDate.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<TodoItem>(
      this.storeName,
      'dueDate',
      startDate,
      endDate
    );
  }

  getTodosByDueDateRange(startDate: Date, endDate: Date): Observable<TodoItem[]> {
    // Ensure we capture the full days
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return this.storageService.queryByDateRange<TodoItem>(
      this.storeName,
      'dueDate',
      start,
      end
    );
  }
}