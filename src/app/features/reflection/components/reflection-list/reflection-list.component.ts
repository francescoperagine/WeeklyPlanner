// src/app/features/reflection/components/reflection-list/reflection-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reflection } from '@shared/models/reflection.model';
import { PlannerItem } from '@shared/models/planner-item.model';

@Component({
  selector: 'app-reflection-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reflection-list.component.html',
  styleUrls: ['./reflection-list.component.css']
})
export class ReflectionListComponent implements OnInit {
  @Input() reflections: Reflection[] = [];
  @Input() plannerItems: PlannerItem[] = [];
  @Input() date: Date = new Date();
  
  @Output() reflectionAdded = new EventEmitter<Reflection>();
  @Output() reflectionUpdated = new EventEmitter<Reflection>();
  @Output() reflectionDeleted = new EventEmitter<string>();
  
  editingReflectionId: string | null = null;
  newReflection: Reflection = this.createEmptyReflection();
  
  constructor() {}
  
  ngOnInit(): void {}
  
  createEmptyReflection(): Reflection {
    return {
      id: '',
      date: new Date(this.date),
      content: '',
      lessons: '',
      improvements: ''
    };
  }
  
  addReflection(): void {
    if (!this.newReflection.content.trim()) return;
    
    this.newReflection.date = new Date(this.date);
    this.reflectionAdded.emit(this.newReflection);
    this.newReflection = this.createEmptyReflection();
  }
  
  updateReflection(reflection: Reflection): void {
    this.reflectionUpdated.emit(reflection);
    this.editingReflectionId = null;
  }
  
  deleteReflection(id: string): void {
    if (confirm('Are you sure you want to delete this reflection?')) {
      this.reflectionDeleted.emit(id);
    }
  }
  
  setEditingReflectionId(id: string): void {
    this.editingReflectionId = id;
  }
  
  clearEditingReflectionId(): void {
    this.editingReflectionId = null;
  }
  
  getActivityTitle(activityId: string | undefined): string {
    if (!activityId) return 'Unknown activity';
    
    const activity = this.plannerItems.find(item => item.id === activityId);
    return activity ? activity.title : 'Unknown activity';
  }
}