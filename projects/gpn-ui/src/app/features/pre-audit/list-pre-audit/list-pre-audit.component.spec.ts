import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPreAuditComponent } from './list-pre-audit.component';

describe('ListPreAuditComponent', () => {
  let component: ListPreAuditComponent;
  let fixture: ComponentFixture<ListPreAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListPreAuditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPreAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
