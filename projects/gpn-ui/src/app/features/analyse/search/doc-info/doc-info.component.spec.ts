import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocInfoComponent } from './doc-info.component';

describe('DocInfoComponent', () => {
  let component: DocInfoComponent;
  let fixture: ComponentFixture<DocInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
