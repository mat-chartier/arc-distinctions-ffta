import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistinctionsListComponent } from './distinctions-list.component';

describe('DistinctionsListComponent', () => {
  let component: DistinctionsListComponent;
  let fixture: ComponentFixture<DistinctionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistinctionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistinctionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
