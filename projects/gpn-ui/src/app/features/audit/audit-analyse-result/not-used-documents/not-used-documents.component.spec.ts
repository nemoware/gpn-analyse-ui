import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotUsedDocumentsComponent } from './not-used-documents.component';

describe('NotUsedDocumentsComponent', () => {
  let component: NotUsedDocumentsComponent;
  let fixture: ComponentFixture<NotUsedDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotUsedDocumentsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotUsedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
