import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookValuesTableComponent } from './book-values-table.component';

describe('BookValuesTableComponent', () => {
  let component: BookValuesTableComponent;
  let fixture: ComponentFixture<BookValuesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BookValuesTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookValuesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
