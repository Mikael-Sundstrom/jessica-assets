import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plants } from './plants';

describe('Plants', () => {
  let component: Plants;
  let fixture: ComponentFixture<Plants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
