import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gate } from './gate';

describe('Gate', () => {
  let component: Gate;
  let fixture: ComponentFixture<Gate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
