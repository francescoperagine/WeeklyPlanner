import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChevronLeftComponent } from './chevron-left.component';

describe('ChevronLeftComponent', () => {
  let component: ChevronLeftComponent;
  let fixture: ComponentFixture<ChevronLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChevronLeftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChevronLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
