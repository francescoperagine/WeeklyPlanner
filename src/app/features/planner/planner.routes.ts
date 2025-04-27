import { Routes } from '@angular/router';
import { WeeklyGridComponent } from './components/weekly-grid/weekly-grid.component';
import { DailyViewComponent } from './components/daily-view/daily-view.component';

export const PLANNER_ROUTES: Routes = [
  { path: '', component: WeeklyGridComponent },
  { path: 'day/:date', component: DailyViewComponent }
];