import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '@core/services/notes.service';
import { Note } from '@shared/models/note.model';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  newNote: Note = this.createEmptyNote();
  tagsInput: string = '';
  editTagsInput: string = '';
  editingNoteId: string | null = null;
  
  // Filter properties
  selectedTag: string = '';
  selectedDate: string = '';
  availableTags: string[] = [];
  
  constructor(private notesService: NotesService) {}
  
  ngOnInit(): void {
    this.loadNotes();
  }
  
  loadNotes(): void {
    this.notesService.getAllNotes().subscribe(notes => {
      this.notes = notes;
      this.filteredNotes = [...notes];
      this.extractAvailableTags();
      this.sortNotesByDate();
    });
  }
  
  createEmptyNote(): Note {
    return {
      id: '',
      content: '',
      date: new Date()
    };
  }
  
  addNote(): void {
    if (!this.newNote.content.trim()) return;
    
    const tags = this.tagsInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const noteToCreate: Omit<Note, 'id'> = {
      content: this.newNote.content.trim(),
      date: new Date(),
      tags: tags.length > 0 ? tags : undefined
    };
    
    this.notesService.createNote(noteToCreate).subscribe(() => {
      this.newNote = this.createEmptyNote();
      this.tagsInput = '';
      this.loadNotes();
    });
  }
  
  updateNote(note: Note): void {
    if (!note.content.trim()) return;
    
    const tags = this.editTagsInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const updatedNote: Note = {
      ...note,
      content: note.content.trim(),
      tags: tags.length > 0 ? tags : undefined
    };
    
    this.notesService.updateNote(updatedNote).subscribe(() => {
      this.clearEditingNoteId();
      this.loadNotes();
    });
  }
  
  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id).subscribe(() => {
        this.loadNotes();
      });
    }
  }
  
  setEditingNoteId(id: string): void {
    this.editingNoteId = id;
    const note = this.notes.find(n => n.id === id);
    if (note && note.tags) {
      this.editTagsInput = note.tags.join(', ');
    } else {
      this.editTagsInput = '';
    }
  }
  
  clearEditingNoteId(): void {
    this.editingNoteId = null;
    this.editTagsInput = '';
  }
  
  filterNotes(): void {
    let filtered = [...this.notes];
    
    // Filter by tag
    if (this.selectedTag) {
      filtered = filtered.filter(note => 
        note.tags && note.tags.includes(this.selectedTag)
      );
    }
    
    // Filter by date
    if (this.selectedDate) {
      const selectedDateObj = new Date(this.selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(selectedDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= selectedDateObj && noteDate < nextDay;
      });
    }
    
    this.filteredNotes = filtered;
    this.sortNotesByDate();
  }
  
  clearFilters(): void {
    this.selectedTag = '';
    this.selectedDate = '';
    this.filteredNotes = [...this.notes];
    this.sortNotesByDate();
  }
  
  private extractAvailableTags(): void {
    const tagsSet = new Set<string>();
    
    this.notes.forEach(note => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    this.availableTags = Array.from(tagsSet).sort();
  }
  
  private sortNotesByDate(): void {
    this.filteredNotes.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}