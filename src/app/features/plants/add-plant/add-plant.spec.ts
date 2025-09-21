import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlant } from './add-plant';

describe('AddPlant', () => {
  let component: AddPlant;
  let fixture: ComponentFixture<AddPlant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
