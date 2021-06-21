import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookValuesFormComponent } from './book-values-form.component';

describe('BookValuesFormComponent', () => {
  let component: BookValuesFormComponent;
  let fixture: ComponentFixture<BookValuesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BookValuesFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookValuesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
