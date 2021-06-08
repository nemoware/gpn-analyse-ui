import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksDocumentComponent } from './links-document.component';

describe('LinksDocumentComponent', () => {
  let component: LinksDocumentComponent;
  let fixture: ComponentFixture<LinksDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LinksDocumentComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
