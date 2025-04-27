import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '@core/services/todo.service';
import { PriorityService } from '@core/services/priority.service';
import { TodoItem } from '@shared/models/todo-item.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  todoItems: TodoItem[] = [];
  newTodoTitle: string = '';
  newTodoPriority: number = 50; // Default medium priority
  filterOption: 'all' | 'active' | 'completed' = 'all';
  
  constructor(
    private todoService: TodoService,
    public priorityService: PriorityService
  ) {}

  ngOnInit(): void {
    this.loadTodoItems();
  }

  loadTodoItems(): void {
    this.todoService.getAllTodos()
      .subscribe(items => {
        this.todoItems = items;
        this.applyFilter();
      });
  }

  applyFilter(): void {
    this.todoService.getAllTodos()
      .subscribe(items => {
        switch (this.filterOption) {
          case 'active':
            this.todoItems = items.filter(item => !item.completed);
            break;
          case 'completed':
            this.todoItems = items.filter(item => item.completed);
            break;
          case 'all':
          default:
            this.todoItems = items;
            break;
        }
      });
  }

  addTodo(): void {
    if (!this.newTodoTitle.trim()) return;

    const newTodo: Omit<TodoItem, 'id'> = {
      title: this.newTodoTitle.trim(),
      completed: false,
      priority: this.newTodoPriority
    };

    this.todoService.createTodo(newTodo)
      .subscribe(() => {
        this.newTodoTitle = '';
        this.loadTodoItems();
      });
  }

  toggleTodoCompletion(todo: TodoItem): void {
    this.todoService.toggleTodoCompletion(todo)
      .subscribe(() => {
        this.loadTodoItems();
      });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id)
      .subscribe(() => {
        this.loadTodoItems();
      });
  }

  updateTodoPriority(todo: TodoItem, priority: number): void {
    this.todoService.updateTodoPriority(todo, priority)
      .subscribe(() => {
        this.loadTodoItems();
      });
  }

  setDueDate(todo: TodoItem, event: Event): void {
    const inputDate = (event.target as HTMLInputElement).value;
    const dueDate = inputDate ? new Date(inputDate) : undefined;
    
    const updatedTodo = {
      ...todo,
      dueDate: dueDate
    };
    
    this.todoService.updateTodo(updatedTodo)
      .subscribe(() => {
        this.loadTodoItems();
      });
  }

  getPriorityClass(priority: number | undefined): string {
    return this.priorityService.getPriorityCssClass(priority);
  }

  trackByTodoId(index: number, item: TodoItem): string {
    return item.id;
  }
}