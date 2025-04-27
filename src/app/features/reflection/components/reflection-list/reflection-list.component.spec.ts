import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflectionListComponent } from './reflection-list.component';

describe('ReflectionListComponent', () => {
  let component: ReflectionListComponent;
  let fixture: ComponentFixture<ReflectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReflectionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReflectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
