import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'planner', pathMatch: 'full' },
  {
    path: 'planner',
    loadChildren: () => import('./features/planner/planner.routes')
      .then(m => m.PLANNER_ROUTES)
  },
  {
    path: 'todo',
    loadChildren: () => import('./features/todo/todo.routes')
      .then(m => m.TODO_ROUTES)
  },
  {
    path: 'notes',
    loadChildren: () => import('./features/notes/notes.routes')
      .then(m => m.NOTES_ROUTES)
  },
  {
    path: 'reflections',
    loadChildren: () => import('./features/reflection/reflection.routes')
      .then(m => m.REFLECTION_ROUTES)
  },
  { path: '**', redirectTo: 'planner' }
];