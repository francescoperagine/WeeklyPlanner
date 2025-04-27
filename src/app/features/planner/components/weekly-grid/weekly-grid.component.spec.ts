import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyGridComponent } from './weekly-grid.component';

describe('WeeklyGridComponent', () => {
  let component: WeeklyGridComponent;
  let fixture: ComponentFixture<WeeklyGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
