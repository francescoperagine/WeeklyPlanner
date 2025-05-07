import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChevronRightComponent } from './chevron-right.component';

describe('ChevronRightComponent', () => {
  let component: ChevronRightComponent;
  let fixture: ComponentFixture<ChevronRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChevronRightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChevronRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
