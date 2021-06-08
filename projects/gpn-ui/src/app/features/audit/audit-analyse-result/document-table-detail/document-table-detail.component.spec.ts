import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTableDetailComponent } from './document-table-detail.component';

describe('DocumentTableDetailComponent', () => {
  let component: DocumentTableDetailComponent;
  let fixture: ComponentFixture<DocumentTableDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentTableDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTableDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
