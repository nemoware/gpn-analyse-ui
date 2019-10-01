import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocInfoComponent } from './doc-info.component';
import { DocumentInfo } from '@app/models/document-info';

describe('DocInfoComponent', () => {
  let component: DocInfoComponent;
  let fixture: ComponentFixture<DocInfoComponent>;
  let doc: DocumentInfo;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    doc = {
      checksum: 0,
      filemtime: 0,
      filename: '',
      len: 0,
      short_filename: '',
      status: 0
    };
    fixture = TestBed.createComponent(DocInfoComponent);
    component = fixture.componentInstance;
    component.doc = doc;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
