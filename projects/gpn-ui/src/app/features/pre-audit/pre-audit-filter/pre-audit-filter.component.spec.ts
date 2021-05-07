import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAuditFilterComponent } from './pre-audit-filter.component';

describe('PreAuditFilterComponent', () => {
  let component: PreAuditFilterComponent;
  let fixture: ComponentFixture<PreAuditFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PreAuditFilterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAuditFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
