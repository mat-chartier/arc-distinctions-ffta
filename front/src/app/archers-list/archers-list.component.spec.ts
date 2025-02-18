import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchersListComponent } from './archers-list.component';

describe('ArchersListComponent', () => {
  let component: ArchersListComponent;
  let fixture: ComponentFixture<ArchersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
