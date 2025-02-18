import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcherDetailsComponent } from './archer-details.component';

describe('ArcherDetailsComponent', () => {
  let component: ArcherDetailsComponent;
  let fixture: ComponentFixture<ArcherDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArcherDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
