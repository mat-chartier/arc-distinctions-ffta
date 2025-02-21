import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistinctionsToOrderComponent } from './distinctions-to-order.component';

describe('DistinctionsToOrderComponent', () => {
  let component: DistinctionsToOrderComponent;
  let fixture: ComponentFixture<DistinctionsToOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistinctionsToOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistinctionsToOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
