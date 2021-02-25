import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharterFilterComponent } from './charter-filter.component';

describe('CharterFilterComponent', () => {
  let component: CharterFilterComponent;
  let fixture: ComponentFixture<CharterFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharterFilterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
