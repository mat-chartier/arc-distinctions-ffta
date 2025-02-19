import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalBestsListComponent } from './personal-bests-list.component';

describe('PersonalBestsListComponent', () => {
  let component: PersonalBestsListComponent;
  let fixture: ComponentFixture<PersonalBestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalBestsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalBestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
